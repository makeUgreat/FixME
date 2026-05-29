import ts from 'typescript';
import { findContainingClassDeclaration } from '../../utils/ast.mjs';

const DOMAIN_MODEL_FILE_PATTERN = /\.(aggregate|entity|vo)\.ts$/;

function getParserServices(context) {
  return context.sourceCode?.parserServices ?? context.parserServices;
}

function getTypeChecker(parserServices) {
  return parserServices?.program?.getTypeChecker();
}

function getAliasedSymbolIfNeeded(checker, symbol) {
  if (!symbol) {
    return undefined;
  }

  if ((symbol.flags & ts.SymbolFlags.Alias) === 0) {
    return symbol;
  }

  return checker.getAliasedSymbol(symbol);
}

function getClassSymbol(checker, parserServices, node) {
  const tsNode = parserServices.esTreeNodeToTSNodeMap?.get(node);

  if (!tsNode) {
    return undefined;
  }

  return getAliasedSymbolIfNeeded(checker, checker.getSymbolAtLocation(tsNode));
}

function isDomainModelDeclaration(declaration) {
  const fileName = declaration.getSourceFile().fileName;

  return DOMAIN_MODEL_FILE_PATTERN.test(fileName);
}

function isSameClassBody(checker, parserServices, newExpression, targetSymbol) {
  const containingClass = findContainingClassDeclaration(newExpression);

  if (!containingClass?.id) {
    return false;
  }

  const containingClassSymbol = getClassSymbol(
    checker,
    parserServices,
    containingClass.id,
  );

  return containingClassSymbol === targetSymbol;
}

const noDirectNewRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow direct construction of domain models outside their own class body.',
    },
    messages: {
      noDirectNew:
        'Create domain models through create, restore, or of instead of new.',
    },
    schema: [],
  },
  create(context) {
    const parserServices = getParserServices(context);
    const checker = getTypeChecker(parserServices);

    if (!parserServices?.esTreeNodeToTSNodeMap || !checker) {
      throw new Error(
        'domain/no-direct-new requires TypeScript parser services.',
      );
    }

    return {
      NewExpression(node) {
        const targetSymbol = getClassSymbol(
          checker,
          parserServices,
          node.callee,
        );
        const declarations = targetSymbol?.declarations ?? [];

        if (!declarations.some(isDomainModelDeclaration)) {
          return;
        }

        if (isSameClassBody(checker, parserServices, node, targetSymbol)) {
          return;
        }

        context.report({
          node,
          messageId: 'noDirectNew',
        });
      },
    };
  },
};

export default noDirectNewRule;
