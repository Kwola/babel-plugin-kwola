
export default function({types: t }) {
  let branchCounter = 0;
  let debugMode = true;

  let callStatementsInteractedWith = new WeakMap();

  let fileIdentifier = Math.random().toString().replace("0.", "").substr(0, 6);

    let globalCounterVariable = `globalKwolaCounter_${fileIdentifier}`;
    let globalEventsVariable= `globalKwolaEvents_${fileIdentifier}`;
    let globalAddEventListener= `global_addEventListener_${fileIdentifier}`;
    let globalRemoveEventListener= `global_removeEventListener_${fileIdentifier}`;

    let globalEventVariableName = `event_${fileIdentifier}`;
    let globalElementVariableName = `element_${fileIdentifier}`;
    let globalFuncVariableName = `func_${fileIdentifier}`;

  let createCatchClause = () => {

      if (debugMode)
      {
          return t.CatchClause(
                t.Identifier("kwolaError"),
                t.BlockStatement([
                    t.expressionStatement(
                        t.CallExpression(
                            t.memberExpression(
                                t.Identifier("console"),
                                t.Identifier("error"),
                                false
                            ),
                            [t.Identifier("kwolaError")]
                        )
                    )
                ])
            );
      }
      else
      {
          return t.CatchClause(
                t.Identifier("kwolaError"),
                t.BlockStatement([])
            );
      }
    }

  let createCounterExpression = (path) =>
  {
    if (path.node.loc)
    {
        let file = path.hub.file.opts.filename;
        let line = path.node.loc.start.line;
    }

    let id = branchCounter;
    branchCounter += 1;

    return t.TryStatement(
                t.BlockStatement(
                    [
                        t.expressionStatement(t.assignmentExpression(
                                "+=",
                                t.memberExpression(
                                    t.Identifier(globalCounterVariable),
                                    t.Identifier(id.toString()),
                                    true
                                ),
                                t.NumericLiteral(1)
                         ))
                    ]
                ),
                t.CatchClause(
                    t.Identifier("kwolaError"),
                    t.BlockStatement([
                        t.TryStatement(
                            t.BlockStatement(
                                [
                                    t.expressionStatement(t.assignmentExpression(
                                            "+=",
                                            t.memberExpression(
                                                t.memberExpression(
                                                    t.Identifier("window"),
                                                    t.Identifier(globalCounterVariable)
                                                ),
                                                t.Identifier(id.toString()),
                                                true
                                            ),
                                            t.NumericLiteral(1)
                                     ))
                                ]
                            ),
                            createCatchClause()
                         )
                    ])
                )
             );
  };

    let containsAddEventListenerFunction = (node) =>
    {
        if (node.type === "Identifier")
        {
            if (node.name === "addEventListener")
            {
                return true;
            }
        }
        if (node.type === "MemberExpression")
        {
            return containsAddEventListenerFunction(node.property);
        }
        return false;
    };

    let containsRemoveEventListenerFunction = (node) =>
    {
        if (node.type === "Identifier")
        {
            if (node.name === "removeEventListener")
            {
                return true;
            }
        }
        if (node.type === "MemberExpression")
        {
            return containsRemoveEventListenerFunction(node.property);
        }
        return false;
    };

    let hasInstalledHeader = false;

  return {
    visitor: {
        CallExpression(path) {
            if(hasInstalledHeader) return;

            if(path.node.arguments.length === 2 &&
                path.node.arguments[0].type === "Identifier" &&
                path.node.arguments[0].name === globalEventVariableName)
            {
                return;
            }

            const origNode = path.node;

            if (callStatementsInteractedWith.has(origNode))
            {
                return;
            }
            callStatementsInteractedWith.set(origNode, {});

            let runOriginalBlock = [t.ExpressionStatement(origNode)];

            if (debugMode)
            {
                runOriginalBlock.splice(0, 0, t.expressionStatement(
                                                t.CallExpression(
                                                    t.memberExpression(
                                                        t.Identifier("console"),
                                                        t.Identifier("error"),
                                                        false
                                                    ),
                                                    [t.Identifier("kwolaError")]
                                                )
                                            ));
            }



            if(containsAddEventListenerFunction(path.node.callee) && path.node.arguments.length === 2)
            {
                path.replaceWith(
                    t.TryStatement(
                        t.BlockStatement([
                            t.expressionStatement(
                                t.CallExpression(
                                    t.Identifier(globalAddEventListener),
                                    [path.node.callee.object].concat(path.node.arguments)
                                )
                            )
                        ]),
                        t.CatchClause(
                            t.Identifier("kwolaError"),
                            t.BlockStatement([
                                t.TryStatement(
                                    t.BlockStatement([
                                        t.expressionStatement(
                                            t.CallExpression(
                                                t.memberExpression(
                                                    t.Identifier('window'),
                                                    t.Identifier(globalAddEventListener)
                                                ),
                                                [path.node.callee.object].concat(path.node.arguments)
                                            )
                                        )
                                    ]),
                                    t.CatchClause(
                                        t.Identifier("kwolaError"),
                                        t.BlockStatement(runOriginalBlock)
                                    )
                                )
                            ])
                        )
                    )
                )
            }
            if(containsRemoveEventListenerFunction(path.node.callee) && path.node.arguments.length === 2)
            {
                path.replaceWith(
                    t.TryStatement(
                        t.BlockStatement([
                            t.expressionStatement(
                                t.CallExpression(
                                    t.Identifier(globalRemoveEventListener),
                                    [path.node.callee.object].concat(path.node.arguments)
                                )
                            )
                        ]),
                        t.CatchClause(
                            t.Identifier("kwolaError"),
                            t.BlockStatement([
                                t.TryStatement(
                                    t.BlockStatement([
                                        t.expressionStatement(
                                            t.CallExpression(
                                                t.memberExpression(
                                                    t.Identifier('window'),
                                                    t.Identifier(globalRemoveEventListener)
                                                ),
                                                [path.node.callee.object].concat(path.node.arguments)
                                            )
                                        )
                                    ]),
                                    t.CatchClause(
                                        t.Identifier("kwolaError"),
                                        t.BlockStatement(runOriginalBlock)
                                    )
                                )
                            ])
                        )
                    )
                );
            }
        },

        BlockStatement(path) {
            if(hasInstalledHeader) return;

            if(path.parent.type === 'TryStatement'
                && path.parent.handler
                && path.parent.handler.param
                && path.parent.handler.param.type === 'Identifier'
                && path.parent.handler.param.name === 'kwolaError'
               )
                {
                    // Ignore this since this is the exact code we inserted and we don't want to recurse infinitely
                    return;
                }

            if(path.parent.type === 'CatchClause'
                && path.parent.param
                && path.parent.param.type === 'Identifier'
                && path.parent.param.name === 'kwolaError'
               )
                {
                    // Ignore this since this is the exact code we inserted and we don't want to recurse infinitely
                    return;
                }

              path.unshiftContainer('body', createCounterExpression(path));
        },

        IfStatement(path) {
            if(hasInstalledHeader) return;

            if(path.node.test.type === 'UnaryExpression'
                && path.node.test.argument.type === 'MemberExpression'
                && path.node.test.argument.object.type === 'Identifier'
                && path.node.test.argument.property.type === 'Identifier'
                && path.node.test.argument.object.name === 'window'
                && (path.node.test.argument.property.name === 'kwolaCounters' || path.node.test.argument.property.name === 'kwolaEvents'))
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
            if(hasInstalledHeader) return;

              path.unshiftContainer('consequent', createCounterExpression(path));
        },

        WhileStatement(path) {
            if(hasInstalledHeader) return;

            if(path.node.body.type !== "BlockStatement")
            {
                path.replaceWith(t.WhileStatement(
                    path.node.test,
                    t.blockStatement([path.node.body])
                ));
            }
        },

        DoWhileStatement(path) {
            if(hasInstalledHeader) return;

            if(path.node.body.type !== "BlockStatement")
            {
                path.replaceWith(t.DoWhileStatement(
                    path.node.test,
                    t.blockStatement([path.node.body])
                ));
            }
        },

        ForStatement(path) {
            if(hasInstalledHeader) return;

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
            if(hasInstalledHeader) return;

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
            if(hasInstalledHeader) return;

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
            if(hasInstalledHeader) return;

            if(path.node.body.type !== "BlockStatement")
            {
                path.replaceWith(t.WithStatement(
                    path.node.object,
                    t.blockStatement([path.node.body])
                ));
            }
        },

        Program: {
            exit(path)
            {
                hasInstalledHeader = true;

                let filePath = path.hub.file.opts.filename;
                const segments = filePath.split("/");
                let file = segments[segments.length - 1];

                path.unshiftContainer('body',
                    t.TryStatement(
                        t.BlockStatement(
                            [
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
                                ),
                                t.IfStatement(
                                    t.UnaryExpression("!",
                                        t.memberExpression(
                                            t.Identifier('window'),
                                            t.Identifier('kwolaEvents')
                                        )
                                    ),
                                    t.expressionStatement(
                                        t.assignmentExpression(
                                            "=",
                                            t.memberExpression(
                                                t.Identifier('window'),
                                                t.Identifier('kwolaEvents')
                                            ),
                                            t.newExpression(
                                                t.Identifier('WeakMap'),
                                                []
                                            )
                                        )

                                    )
                                ),
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
                                        t.Identifier(globalCounterVariable)
                                    )
                                ),
                                t.expressionStatement(
                                    t.assignmentExpression(
                                        "=",
                                        t.memberExpression(
                                            t.Identifier('window'),
                                            t.Identifier(globalCounterVariable)
                                        ),
                                        t.Identifier(globalCounterVariable)
                                    )
                                ),
                                t.expressionStatement(
                                    t.assignmentExpression(
                                        "=",
                                        t.memberExpression(
                                            t.Identifier('window'),
                                            t.Identifier(globalAddEventListener)
                                        ),
                                        t.Identifier(globalAddEventListener)
                                    )
                                ),
                                t.expressionStatement(
                                    t.assignmentExpression(
                                        "=",
                                        t.memberExpression(
                                            t.Identifier('window'),
                                            t.Identifier(globalRemoveEventListener)
                                        ),
                                        t.Identifier(globalRemoveEventListener)
                                    )
                                ),
                                t.expressionStatement(
                                    t.assignmentExpression(
                                        "=",
                                        t.Identifier(globalEventsVariable),
                                        t.memberExpression(
                                            t.Identifier('window'),
                                            t.Identifier('kwolaEvents')
                                        )
                                    )
                                )
                            ]
                        ),
                        createCatchClause()
                    )
                );

                path.unshiftContainer('body',
                    t.VariableDeclaration("var", [

                        t.VariableDeclarator(
                            t.Identifier(globalAddEventListener),

                            t.ArrowFunctionExpression(
                                [t.Identifier(globalElementVariableName), t.Identifier(globalEventVariableName), t.Identifier(globalFuncVariableName)],
                                t.BlockStatement(
                                    [
                                        t.IfStatement(
                                            t.UnaryExpression(
                                                "!",
                                                t.CallExpression(
                                                    t.MemberExpression(
                                                        t.Identifier(globalEventsVariable),
                                                        t.Identifier("has")
                                                    ),
                                                    [t.Identifier(globalElementVariableName)]
                                                )
                                            ),
                                            t.ExpressionStatement(
                                                t.CallExpression(
                                                    t.MemberExpression(
                                                        t.Identifier(globalEventsVariable),
                                                        t.Identifier("set")
                                                    ),
                                                    [t.Identifier(globalElementVariableName), t.ArrayExpression([])]
                                                )
                                            )
                                        ),
                                        t.ExpressionStatement(
                                            t.CallExpression(
                                                t.MemberExpression(
                                                    t.CallExpression(
                                                        t.MemberExpression(
                                                            t.Identifier(globalEventsVariable),
                                                            t.Identifier("get")
                                                        ),
                                                        [t.Identifier(globalElementVariableName)]
                                                    ),
                                                    t.Identifier("push")
                                                ),
                                                [
                                                    t.Identifier(globalEventVariableName)
                                                ]
                                            )
                                        ),
                                        t.ExpressionStatement(
                                            t.CallExpression(
                                                t.MemberExpression(
                                                    t.Identifier(globalElementVariableName),
                                                    t.Identifier("addEventListener")
                                                ),
                                                [
                                                    t.Identifier(globalEventVariableName),
                                                    t.Identifier(globalFuncVariableName)
                                                ]
                                            )
                                        )
                                    ]
                                )
                            )
                        )
                    ])
                );


                path.unshiftContainer('body',
                    t.VariableDeclaration("var", [

                        t.VariableDeclarator(
                            t.Identifier(globalRemoveEventListener),

                            t.ArrowFunctionExpression(
                                [t.Identifier(globalElementVariableName), t.Identifier(globalEventVariableName), t.Identifier(globalFuncVariableName)],
                                t.BlockStatement(
                                    [
                                        t.IfStatement(
                                            t.UnaryExpression(
                                                "!",
                                                t.CallExpression(
                                                    t.MemberExpression(
                                                        t.Identifier(globalEventsVariable),
                                                        t.Identifier("has")
                                                    ),
                                                    [t.Identifier(globalElementVariableName)]
                                                )
                                            ),
                                            t.ExpressionStatement(
                                                t.CallExpression(
                                                    t.MemberExpression(
                                                        t.Identifier(globalEventsVariable),
                                                        t.Identifier("set")
                                                    ),
                                                    [t.Identifier(globalElementVariableName), t.ArrayExpression([])]
                                                )
                                            )
                                        ),
                                        t.IfStatement(
                                            t.CallExpression(
                                                t.MemberExpression(
                                                    t.CallExpression(
                                                        t.MemberExpression(
                                                            t.Identifier(globalEventsVariable),
                                                            t.Identifier("get")
                                                        ),
                                                        [t.Identifier(globalElementVariableName)]
                                                    ),
                                                    t.Identifier("includes")
                                                ),
                                                [t.Identifier(globalEventVariableName)]
                                            ),
                                            t.ExpressionStatement(
                                                t.CallExpression(
                                                    t.MemberExpression(
                                                        t.CallExpression(
                                                            t.MemberExpression(
                                                                t.Identifier(globalEventsVariable),
                                                                t.Identifier("get")
                                                            ),
                                                            [t.Identifier(globalElementVariableName)]
                                                        ),
                                                        t.Identifier("splice")
                                                    ),
                                                    [t.CallExpression(
                                                        t.MemberExpression(
                                                            t.CallExpression(
                                                                t.MemberExpression(
                                                                    t.Identifier(globalEventsVariable),
                                                                    t.Identifier("get")
                                                                ),
                                                                [t.Identifier(globalElementVariableName)]
                                                            ),
                                                            t.Identifier("indexOf")
                                                        ),
                                                        [t.Identifier(globalEventVariableName)]
                                                    ), t.NumericLiteral(1)]
                                                )
                                            )
                                        ),
                                        t.ExpressionStatement(
                                            t.CallExpression(
                                                t.MemberExpression(
                                                    t.Identifier(globalElementVariableName),
                                                    t.Identifier("removeEventListener")
                                                ),
                                                [
                                                    t.Identifier(globalEventVariableName),
                                                    t.Identifier(globalFuncVariableName)
                                                ]
                                            )
                                        )
                                    ]
                                )
                            )
                        )
                    ])
                );

                path.unshiftContainer('body',
                    t.VariableDeclaration("var", [
                        t.VariableDeclarator(
                            t.Identifier(globalCounterVariable),
                            t.newExpression(
                                t.Identifier('Uint32Array'),
                                [t.NumericLiteral(branchCounter)]
                            )
                        )
                    ])
                );

                path.unshiftContainer('body',
                    t.VariableDeclaration("var", [

                        t.VariableDeclarator(
                            t.Identifier(globalEventsVariable),
                            t.newExpression(
                                t.Identifier('WeakMap'),
                                []
                            )
                        )
                    ])
                );

            }
        },
    }
  };
}
