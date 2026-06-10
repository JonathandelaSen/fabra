import type { AIProvider } from "@/modules/shared";
import type {
  DraftEntryInput,
  JournalAIServiceFactory,
} from "../../domain/repositories/journal-ai-service.repository";

export class DraftEntryUseCase {
  constructor(
    private readonly deps: {
      aiFactory: JournalAIServiceFactory;
    }
  ) {}

  async execute(
    userId: string,
    contextId: string,
    input: DraftEntryInput & {
      provider: AIProvider;
      apiKey?: string;
      baseUrl?: string;
      model: string;
    }
  ): Promise<string> {
    const { provider, apiKey, baseUrl, model, ...draftInput } = input;
    const aiService = this.deps.aiFactory.create({
      provider,
      apiKey,
      baseUrl,
      model,
    });
    const finalText = await aiService.draftEntry({
      ...draftInput,
    });

    return finalText;
  }
}
