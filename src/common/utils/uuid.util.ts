/**
 * Convertir une chaîne UUID en tampon
 * @param uuid - Chaîne UUID (example: '550e8400-e29b-41d4-a716-446655440000')
 * @returns Buffer 객체
 */
export function uuidToBuffer(uuid: string): Buffer {
  const hex = uuid.replace(/-/g, '');
  return Buffer.from(hex, 'hex');
}

/**
 * Convertir le Buffer en chaîne UUID
 * @param buffer - Buffer au format BINARY(16)
 * @returns UUID Chaîne
 */
const UUID_HEX_REGEX = RegExp(/^([0-9a-fA-F]{8})-?([0-9a-fA-F]{4})-?([0-9a-fA-F]{4})-?([0-9a-fA-F]{4})-?([0-9a-fA-F]{12})$/);
export function bufferToUuid(buffer: Buffer): string | undefined {
  const hex = buffer.toString('hex');
  if (!UUID_HEX_REGEX.test(hex)) {
    throw new Error('Invalid buffer');
  }
  const match = UUID_HEX_REGEX.exec(hex);
  if (!match) {
    return undefined;
  }
  // match[0]은 전체 매칭 문자열이므로 match[1]부터 사용
  return `${match[1]}-${match[2]}-${match[3]}-${match[4]}-${match[5]}`;
}
