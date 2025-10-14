/**
 * UUID 문자열을 Buffer로 변환
 * @param uuid - UUID 문자열 (예: '550e8400-e29b-41d4-a716-446655440000')
 * @returns Buffer 객체
 */
export function uuidToBuffer(uuid: string): Buffer {
  const hex = uuid.replace(/-/g, '');
  return Buffer.from(hex, 'hex');
}

/**
 * Buffer를 UUID 문자열로 변환
 * @param buffer - BINARY(16) 형식의 Buffer
 * @returns UUID 문자열
 */
export function bufferToUuid(buffer: Buffer): string {
  const hex = buffer.toString('hex');
  return [
    hex.substring(0, 8),
    hex.substring(8, 12),
    hex.substring(12, 16),
    hex.substring(16, 20),
    hex.substring(20, 32),
  ].join('-');
}
