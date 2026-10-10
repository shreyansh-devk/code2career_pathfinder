import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { extractJsonMiddleware, wrapLanguageModel } from 'ai';

export const openRouterModelId = 'nvidia/nemotron-3-ultra-550b-a55b:free';

export function openRouterModel(apiKey: string, modelId = openRouterModelId, fetch?: typeof globalThis.fetch) {
  const provider = createOpenAICompatible({ name:'openrouter', baseURL:'https://openrouter.ai/api/v1', apiKey, fetch });
  return wrapLanguageModel({
    model:provider.chatModel(modelId),
    middleware:[{
      specificationVersion:'v4',
      transformParams:async ({ params }) => {
        const format=params.responseFormat;
        // The selected free endpoint does not advertise response_format support.
        // Request JSON in the prompt; Output.object and the domain validators still enforce it.
        return {
          ...params, responseFormat:undefined,
          prompt:format?.type==='json' && format.schema ? [{ role:'system',content:`Return only a JSON object matching this JSON Schema. Do not include commentary or markdown: ${JSON.stringify(format.schema)}` },...params.prompt] : params.prompt,
          providerOptions:{ ...params.providerOptions,openrouter:{ ...params.providerOptions?.openrouter,reasoning:{ enabled:false } } },
        };
      },
    },extractJsonMiddleware()],
  });
}
