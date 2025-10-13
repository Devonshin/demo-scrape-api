/**
 * @author Dongwoo
 * @date 2025-10-13
 * Transaction 관리 서비스
 * 데이터베이스 트랜잭션을 시작하고 관리하는 서비스
 */
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize, Transaction } from 'sequelize';

/**
 * Transaction 관리 서비스
 * 데이터베이스 트랜잭션을 생성하고 관리
 */
@Injectable()
export class TransactionService {
  constructor(
    @InjectConnection()
    private readonly sequelize: Sequelize,
  ) {}

  /**
   * 새로운 트랜잭션 시작
   * @returns Transaction 인스턴스
   */
  async startTransaction(): Promise<Transaction> {
    return await this.sequelize.transaction();
  }

  /**
   * 트랜잭션 커밋
   * @param transaction 커밋할 트랜잭션
   */
  async commit(transaction: Transaction): Promise<void> {
    await transaction.commit();
  }

  /**
   * 트랜잭션 롤백
   * @param transaction 롤백할 트랜잭션
   */
  async rollback(transaction: Transaction): Promise<void> {
    await transaction.rollback();
  }

  /**
   * 트랜잭션 내에서 함수 실행
   * 성공 시 자동 커밋, 실패 시 자동 롤백
   * @param callback 트랜잭션 내에서 실행할 콜백 함수
   * @returns 콜백 함수의 반환값
   */
  async runInTransaction<T>(
    callback: (transaction: Transaction) => Promise<T>,
  ): Promise<T> {
    const transaction = await this.startTransaction();

    try {
      const result = await callback(transaction);
      await this.commit(transaction);
      return result;
    } catch (error) {
      await this.rollback(transaction);
      throw error;
    }
  }
}
