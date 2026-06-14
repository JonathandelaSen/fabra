function isActionMemberExpression(node) {
  if (node.type !== "MemberExpression") return false;

  if (!node.computed) {
    return node.property.type === "Identifier" && node.property.name === "action";
  }

  return node.property.type === "Literal" && node.property.value === "action";
}

function isStringLiteral(node) {
  return node.type === "Literal" && typeof node.value === "string";
}

function isStringLiteralType(node) {
  return node.type === "TSLiteralType" && isStringLiteral(node.literal);
}

const noHardcodedStringContracts = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Require constants when comparing an action discriminant with a string",
    },
    schema: [],
    messages: {
      useConstant:
        "Use a named constant instead of comparing `.action` with the string literal {{value}}.",
      useConstantType:
        "Derive this string union from named constants instead of hardcoding its values.",
    },
  },

  create(context) {
    return {
      BinaryExpression(node) {
        if (node.operator !== "===" && node.operator !== "!==") return;

        const actionSide = isActionMemberExpression(node.left)
          ? node.left
          : isActionMemberExpression(node.right)
            ? node.right
            : null;
        const literalSide = isStringLiteral(node.left)
          ? node.left
          : isStringLiteral(node.right)
            ? node.right
            : null;

        if (!actionSide || !literalSide) return;

        context.report({
          node: literalSide,
          messageId: "useConstant",
          data: { value: JSON.stringify(literalSide.value) },
        });
      },
      TSUnionType(node) {
        if (node.types.length < 2 || !node.types.every(isStringLiteralType)) {
          return;
        }

        context.report({
          node,
          messageId: "useConstantType",
        });
      },
    };
  },
};

export default noHardcodedStringContracts;
