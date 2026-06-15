import { RuleTester } from "eslint";
import typescriptParser from "@typescript-eslint/parser";
import rule from "./no-hardcoded-string-contracts.mjs";

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    parser: typescriptParser,
  },
});

ruleTester.run("no-hardcoded-string-contracts", rule, {
  valid: [
    'input.action === CHAT_ACTIONS.createConversation;',
    'input.status === "pending";',
    '"create_conversation" === CHAT_ACTIONS.createConversation;',
    'input["action"] === CHAT_ACTIONS.createConversation;',
    'expect(input.action).toBe("create_conversation");',
    "interface Response { role: ChatRole }",
    'type OptionalRole = "user" | null;',
    'type Role = "user" | "assistant";',
    'export type CommitmentStatus = "active" | "paused";',
    'type Update = Omit<Entity, "id" | "createdAt">;',
    'type Summary = Pick<Entity, "id" | "title">;',
    'interface Input { context: Pick<Context, "type" | "name" | "roleOrLabel"> }',
    'type Nested = Partial<Pick<Entity, "id" | "title">>;',
  ],
  invalid: [
    {
      code: 'input.action === "create_conversation";',
      errors: [{ messageId: "useConstant" }],
    },
    {
      code: '"rename_conversation" !== parsed.value.action;',
      errors: [{ messageId: "useConstant" }],
    },
    {
      code: 'input["action"] === "delete_conversation";',
      errors: [{ messageId: "useConstant" }],
    },
    {
      code: 'interface Response { role: "user" | "assistant" }',
      errors: [{ messageId: "useConstantType" }],
    },
    {
      code: 'const [mode] = useState<"login" | "signup">("login");',
      errors: [{ messageId: "useConstantType" }],
    },
  ],
});
