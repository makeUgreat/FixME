function isResultTypeName(typeName) {
  if (typeName.type === 'Identifier') {
    return typeName.name === 'Result';
  }

  return (
    typeName.type === 'TSQualifiedName' &&
    typeName.left.type === 'Identifier' &&
    typeName.left.name === 'neverthrow' &&
    typeName.right.type === 'Identifier' &&
    typeName.right.name === 'Result'
  );
}

export function hasResultReturnType(node) {
  const typeAnnotation = node.value.returnType?.typeAnnotation;

  return (
    typeAnnotation?.type === 'TSTypeReference' &&
    isResultTypeName(typeAnnotation.typeName)
  );
}
