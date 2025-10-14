/**
 * @author Devonshin
 * @date 2025-01-13
 * Interface du cas d’usage de gestion des balises de source
 */
import { SourceTagDomain } from '../../../domain/entities/source-tag.domain';

/**
 * Commande de création de balise de source
 */
export interface CreateSourceTagCommand {
  sourceId: string;
  fieldName: string;
  tagName: string;
  className?: string;
}

/**
 * Commande de modification de balise de source
 */
export interface UpdateSourceTagCommand {
  id: number;
  fieldName: string;
  tagName: string;
  className?: string;
}

/**
 * Cas d’usage de gestion des balises de source
 * Gère les informations des champs cibles de scraping par source.
 */
export interface IManageSourceTagsUseCase {
  /**
   * Récupérer toutes les balises d’une source donnée
   * @param sourceId ID de la source
   * @returns Liste des balises de la source
   */
  getSourceTags(sourceId: string): Promise<SourceTagDomain[]>;

}
