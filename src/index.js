
export default function({types: t }) {
  let branchCounter = 0;

  let fileIdentifier = Math.random().toString().replace("0.", "");

  let globalCounterVariable = `globalKwolaCounter_${fileIdentifier}`;

  let createCounterExpression = (path) =>
  {
    if (path.node.loc)
    {
        let file = path.hub.file.opts.filename;
        let line = path.node.loc.start.line;
    }

    let id = branchCounter;
    branchCounter += 1;

    return  t.assignmentExpression(
                    "+=",
                    t.memberExpression(
                        t.Identifier(globalCounterVariable),
                        t.Identifier(id.toString()),
                        true
                    ),
                    t.NumericLiteral(1)
             );

  };


  return {
    visitor: {
        Program: {
           exit(path)
           {
              let filePath = path.hub.file.opts.filename;
              const segments = filePath.split("/");
              let file = segments[segments.length - 1];

              path.unshiftContainer('body',
                  t.VariableDeclaration("const", [

                      t.VariableDeclarator(
                            t.Identifier(globalCounterVariable),
                            t.memberExpression(
                                t.memberExpression(
                                        t.Identifier('window'),
                                        t.Identifier('kwolaCounters')
                                    ),
                                    t.stringLiteral(file),
                                    true
                                )
                     )

                  ])
              );

              path.unshiftContainer('body',
                  t.expressionStatement(
                      t.assignmentExpression(
                            "=",
                            t.memberExpression(
                                t.memberExpression(
                                        t.Identifier('window'),
                                        t.Identifier('kwolaCounters')
                                    ),
                                    t.stringLiteral(file),
                                    true
                                ),

                            t.newExpression(
                                    t.Identifier('Uint32Array'),
                                    [t.NumericLiteral(branchCounter)]
                                )
                     )

                  )
              );

              path.unshiftContainer('body',
                  t.IfStatement(
                      t.UnaryExpression("!",
                            t.memberExpression(
                                    t.Identifier('window'),
                                    t.Identifier('kwolaCounters')
                                )
                        ),
                  t.expressionStatement(
                      t.assignmentExpression(
                            "=",
                            t.memberExpression(
                                    t.Identifier('window'),
                                    t.Identifier('kwolaCounters')
                                ),
                            t.ObjectExpression([])
                     )

                  )
                  )
              );
          }
        },

        BlockStatement(path) {
              path.unshiftContainer('body', t.expressionStatement(createCounterExpression(path)));
        },

        IfStatement(path) {
            if(path.node.test.type === 'UnaryExpression'
                && path.node.test.argument.type === 'MemberExpression'
                && path.node.test.argument.object.type === 'Identifier'
                && path.node.test.argument.property.type === 'Identifier'
                && path.node.test.argument.object.name === 'window'
                && path.node.test.argument.property.name === 'kwolaCounters')
                {
                    // Ignore this one
                    return;
                }

            if(path.node.consequent.type !== "BlockStatement")
            {
                path.replaceWith(t.IfStatement(
                    path.node.test,
                    t.blockStatement([path.node.consequent]),
                    path.node.alternate
                ));
            }

            if(path.node.alternate && path.node.alternate.type !== "BlockStatement")
            {
                path.replaceWith(t.IfStatement(
                    path.node.test,
                    path.node.consequent,
                    t.blockStatement([path.node.alternate]),
                ));
            }
        },

        SwitchCase(path) {
              path.unshiftContainer('consequent', t.expressionStatement(createCounterExpression(path)));
        },

        WhileStatement(path) {
            if(path.node.body.type !== "BlockStatement")
            {
                path.replaceWith(t.WhileStatement(
                    path.node.test,
                    t.blockStatement([path.node.body])
                ));
            }
        },

        DoWhileStatement(path) {
            if(path.node.body.type !== "BlockStatement")
            {
                path.replaceWith(t.DoWhileStatement(
                    path.node.test,
                    t.blockStatement([path.node.body])
                ));
            }
        },

        ForStatement(path) {
            if(path.node.body.type !== "BlockStatement")
            {
                path.replaceWith(t.ForStatement(
                    path.node.init,
                    path.node.test,
                    path.node.update,
                    t.blockStatement([path.node.body])
                ));
            }
        },

        ForInStatement(path) {
            if(path.node.body.type !== "BlockStatement")
            {
                path.replaceWith(t.ForInStatement(
                    path.node.left,
                    path.node.right,
                    t.blockStatement([path.node.body])
                ));
            }
        },

        ForOfStatement(path) {
            if(path.node.body.type !== "BlockStatement")
            {
                path.replaceWith(t.ForOfStatement(
                    path.node.left,
                    path.node.right,
                    t.blockStatement([path.node.body])
                ));
            }
        },

        WithStatement(path) {
            if(path.node.body.type !== "BlockStatement")
            {
                path.replaceWith(t.WithStatement(
                    path.node.object,
                    t.blockStatement([path.node.body])
                ));
            }
        },
    }
  };
}
