export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow any comments in source files',
      recommended: false,
    },
    schema: [],
  },
  create(context) {
    return {
      Program(node) {
        const sourceCode = context.getSourceCode();
        const comments = sourceCode.getAllComments();
        comments.forEach(comment => {
          context.report({ loc: comment.loc, message: 'Comments are not allowed in this repository.' });
        });
      },
    };
  },
};
