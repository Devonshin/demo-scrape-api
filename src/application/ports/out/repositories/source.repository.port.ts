/**
 * @author Dongwoo
 * @date 2025-10-13
 * Interface du référentiel source
 */
import {SourceDomain} from '../../../../domain/entities/source.domain';

/**
 * Interface du référentiel source
 */
export interface SourceRepositoryPort {

  /**
   * Recherche par ID de source
   * @param id Source ID
   * @returns La source recherchée ou nulle
   */
  findById(id: string): Promise<SourceDomain | null>;

  /**
   * Recherche par nom de source
   * @param name Nom de la source
   * @returns La source recherchée ou nulle
   */
  findByName(name: string): Promise<SourceDomain | null>;

  /**
   * Consulter toutes les sources
   * @returns Liste des sources
   */
  findAll(): Promise<SourceDomain[]>;

}
