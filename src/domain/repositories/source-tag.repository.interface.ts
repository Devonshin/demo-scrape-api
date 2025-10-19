/**
 * @author Devonshin
 * @date 2025-01-13
 * SourceTag Interface du référentiel
 */
import {SourceTagDomain} from '../entities/source-tag.domain';

/**
 * Interface du référentiel SourceTag
 */
export interface ISourceTagRepository {

  /**
   * Afficher toutes les étiquettes d'une source spécifique
   * @param sourceId Source ID
   * @returns Une liste de balises de cette source
   */
  findBySourceId(sourceId: string): Promise<SourceTagDomain[]>;
}
