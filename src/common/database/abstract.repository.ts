import { Logger, NotFoundException } from '@nestjs/common';

import { EntityManager, FindOptionsWhere, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { AbstractEntity } from './abstract.entity';

export abstract class AbstractRepository<T extends AbstractEntity<T>> {
  protected abstract readonly logger: Logger;
  constructor(
    public readonly entityRepository: Repository<T>,
    private readonly entityManager: EntityManager,
  ) {}

  /**
   * Creates and saves a new entity in the database.
   * @param entity The entity to be created.
   * @returns A promise that resolves to the created entity.
   */
  async create(entity: T): Promise<T> {
    return this.entityManager.save(entity);
  }

  /**
   * Finds an entity by specified conditions.
   * @param where The conditions to find the entity.
   * @returns A promise that resolves to the found entity.
   * @throws {NotFoundException} If no entity is found with the specified conditions.
   */
  async findOne(where: FindOptionsWhere<T>): Promise<T> {
    const entity = await this.entityRepository.findOne({ where });

    if (!entity) {
      this.logger.warn('Entity not found with where', where);
      throw new NotFoundException();
    }
    return entity;
  }

  /**
   * Finds an entity by conditions and updates it with partial data.
   * @param where The conditions to find the entity.
   * @param partialEntity The partial data to update the entity with.
   * @returns A promise that resolves to the update result.
   * @throws {NotFoundException} If no entity is found with the specified conditions.
   */
  async findOneAndUpdate(
    where: FindOptionsWhere<T>,
    partialEntity: QueryDeepPartialEntity<T>,
  ) {
    const updResult = await this.entityRepository.update(where, partialEntity);
    if (!updResult.affected) {
      this.logger.warn('Document was not found with the filtered query', where);
      throw new NotFoundException();
    }
    return updResult;
  }

  /**
   * Finds all entities matching the specified conditions.
   * @param where The conditions to find the entities.
   * @returns A promise that resolves to an array of found entities.
   */
  async find(where: FindOptionsWhere<T>): Promise<T[]> {
    return this.entityRepository.findBy(where);
  }

  /**
   * Finds an entity by conditions and deletes it.
   * @param where The conditions to find the entity.
   * @returns A promise that resolves to the delete result.
   */
  async findOneAndDelete(where: FindOptionsWhere<T>) {
    return await this.entityRepository.delete(where);
  }
}
