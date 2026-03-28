// ════════════════════════════════════════
//  Supabase Edge Function — identify-bird
//  Usa Hugging Face Inference API (GRATUITO, sem chave de API obrigatória).
//  O front-end já chama a HF API diretamente do browser — esta Edge Function
//  serve apenas como proxy opcional (evita CORS em alguns ambientes).
//
//  Deploy (opcional):
//  supabase functions deploy identify-bird --no-verify-jwt
// ════════════════════════════════════════

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Hugging Face — gratuito, sem necessidade de chave de API
// Modelo especializado em aves (525 espécies)
const HF_MODEL_URL = "https://api-inference.huggingface.co/models/chriamue/bird-species-classifier";
const HF_BACKUP_URL = "https://api-inference.huggingface.co/models/dennisjooo/Birds-Classifier-EfficientNetB2";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const { imageBase64 } = await req.json();
    if (!imageBase64) throw new Error("imageBase64 é obrigatório");

    // Converte base64 → Uint8Array (bytes brutos da imagem)
    const binaryStr = atob(imageBase64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    // Tenta o modelo principal
    let hfResp = await fetch(HF_MODEL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/octet-stream" },
      body: bytes,
    });

    // 503 = cold start — espera e tenta backup
    if (hfResp.status === 503) {
      const body = await hfResp.json().catch(() => ({}));
      const wait = Math.min((body.estimated_time ?? 20), 30) * 1000;
      await new Promise(r => setTimeout(r, wait));

      hfResp = await fetch(HF_BACKUP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/octet-stream" },
        body: bytes,
      });
    }

    if (!hfResp.ok) {
      const errText = await hfResp.text().catch(() => "");
      throw new Error(`HuggingFace ${hfResp.status}: ${errText.slice(0, 200)}`);
    }

    type HFResult = { label: string; score: number };
    const hfData: HFResult[] = await hfResp.json();

    // Formata para o padrão esperado pelo frontend
    const results = (Array.isArray(hfData) ? hfData : [])
      .slice(0, 6)
      .map((r) => {
        const label = (r.label || "").replace(/_/g, " ").trim();
        const score = Math.round((r.score || 0) * 100);
        const notes =
          score >= 80
            ? "Alta confiança — características bem visíveis"
            : score >= 50
            ? "Confiança moderada — confira as marcas de campo"
            : "Baixa confiança — foto pode estar parcialmente obscurecida";
        return {
          sci: "",          // será resolvido pelo frontend via SC_BIRDS
          pop: label,
          confidence: score,
          notes,
        };
      });

    return new Response(JSON.stringify({ results, source: "hf" }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("identify-bird error:", message);
    return new Response(
      JSON.stringify({ error: message, results: [], source: "error" }),
      {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      }
    );
  }
});
