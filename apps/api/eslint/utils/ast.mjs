export function getMethodName(node) {
  if (node.key.type === 'Identifier') {
    return node.key.name;
  }

  if (node.key.type === 'Literal' && typeof node.key.value === 'string') {
    return node.key.value;
  }

  return undefined;
}

export function isPublicStaticMethod(node) {
  return (
    node.static === true &&
    node.kind === 'method' &&
    node.accessibility !== 'private' &&
    node.accessibility !== 'protected'
  );
}

export function findContainingClassDeclaration(node) {
  let current = node.parent;

  while (current) {
    if (current.type === 'ClassDeclaration') {
      return current;
    }

    current = current.parent;
  }

  return undefined;
}
