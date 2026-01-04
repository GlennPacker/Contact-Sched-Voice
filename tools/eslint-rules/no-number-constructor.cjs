module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: "Disallow using the Number constructor; prefer unary + for coercion",
      recommended: false,
    },
    schema: [],
    messages: {
      useUnaryPlus: "Use unary + instead of Number() for numeric coercion."
    }
  },
  create(context) {
    return {
      CallExpression(node) {
        if (node.callee && node.callee.type === 'Identifier' && node.callee.name === 'Number') {
          context.report({ node, messageId: 'useUnaryPlus' })
        }
      }
    }
  }
}
