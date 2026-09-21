/**
 * Helpers pour la gestion des erreurs et des résultats de création en masse
 */

/**
 * Construit le payload pour la création en masse d'objectifs
 * @param {Array} targetCards - Les cartes cibles
 * @param {Object} selectedType - Le type sélectionné
 * @param {String} description - La description
 * @returns {Object} - Le payload pour l'API
 */
export const buildBulkCreatePayload = (targetCards, selectedType, description) => {
    const objectives = [];

    targetCards.forEach(card => {
        const natures = [];

        // Si la carte utilise la structure multi-natures
        if (card.natures) {
            // Pour chaque nature (subscription, collection)
            Object.keys(card.natures).forEach(nature => {
                const natureData = card.natures[nature];

                // Ajouter une nature pour chaque entrée avec une valeur
                if (natureData.value) {
                    natures.push({
                        nature: nature,
                        parent_uid: natureData.parent?.uid || null,
                        value: parseFloat(natureData.value),
                        begin_date: natureData.begin_date,
                        end_date: natureData.end_date
                    });
                }
            });
        } else {
            // Ancien format (pour compatibilité)
            if (card.value) {
                natures.push({
                    nature: card.nature || 'subscription',
                    parent_uid: card.parent?.uid || null,
                    value: parseFloat(card.value),
                    begin_date: card.begin_date,
                    end_date: card.end_date
                });
            }
        }

        // Ajouter l'objectif seulement s'il a au moins une nature
        if (natures.length > 0) {
            objectives.push({
                target_uid: card.target.uid,
                natures: natures
            });
        }
    });

    return {
        type: selectedType.name,
        description: description,
        objectives: objectives
    };
};

/**
 * Traite les résultats de l'API et extrait les messages d'erreur détaillés par cible
 * @param {Object} data - Les données retournées par l'API (result.data)
 * @param {Array} targetCards - Les cartes cibles actuelles
 * @param {Function} t - Fonction de traduction
 * @returns {Object} - { errorMessages, errorsByCard }
 */
export const processBulkCreateResults = (data, targetCards, t) => {
    const errorMessages = [];
    const errorsByCard = {};
    
    if (!data || !data.results) {
        return { errorMessages, errorsByCard };
    }
    
    data.results.forEach(targetResult => {
        const failedNatures = targetResult.natures.filter(n => !n.success);
        const card = targetCards[targetResult.target_index];
        const targetName = card?.target?.name || card?.target?.label || `Cible #${targetResult.target_index + 1}`;
        
        failedNatures.forEach(nature => {
            const natureLabel = nature.nature === 'subscription' ? t('subscription') : 
                              nature.nature === 'collection' ? t('collection') : nature.nature;
            const errorMsg = `${targetName} - ${natureLabel}: ${nature.error}`;
            errorMessages.push(errorMsg);
            
            // Stocker l'erreur par card pour affichage inline
            if (!errorsByCard[targetResult.target_index]) {
                errorsByCard[targetResult.target_index] = {};
            }
            errorsByCard[targetResult.target_index][nature.nature] = nature.error;
        });
    });
    
    return { errorMessages, errorsByCard };
};

/**
 * Met à jour les cartes en fonction des résultats de l'API
 * @param {Array} targetCards - Les cartes actuelles
 * @param {Array} targetsToRemove - Les indices des cibles à retirer complètement
 * @param {Array} naturesToRemove - Les natures à retirer par cible
 * @param {Object} errorsByCard - Les erreurs par cible
 * @returns {Array} - Les cartes mises à jour
 */
export const updateCardsAfterBulkCreate = (targetCards, targetsToRemove, naturesToRemove, errorsByCard) => {
    let updatedCards = [...targetCards];
    
    // 1. Retirer complètement les cibles où toutes les natures ont réussi
    if (targetsToRemove && targetsToRemove.length > 0) {
        // Réindexer errorsByCard après suppression
        const newErrorsByCard = {};
        let newIndex = 0;
        targetCards.forEach((card, oldIndex) => {
            if (!targetsToRemove.includes(oldIndex)) {
                if (errorsByCard[oldIndex]) {
                    newErrorsByCard[newIndex] = errorsByCard[oldIndex];
                }
                newIndex++;
            }
        });
        
        updatedCards = updatedCards.filter((_, index) => !targetsToRemove.includes(index));
        
        // Mettre à jour errorsByCard avec les nouveaux indices
        Object.keys(newErrorsByCard).forEach(key => {
            errorsByCard[key] = newErrorsByCard[key];
        });
    }
    
    // 2. Pour les cibles partielles, retirer uniquement les natures qui ont réussi
    if (naturesToRemove && naturesToRemove.length > 0) {
        updatedCards = updatedCards.map((card, index) => {
            const naturesToRemoveForThisCard = naturesToRemove.filter(nr => nr.target_index === index);
            
            if (naturesToRemoveForThisCard.length === 0) {
                return card;
            }
            
            const updatedNatures = { ...card.natures };
            naturesToRemoveForThisCard.forEach(nr => {
                delete updatedNatures[nr.nature];
            });
            
            return { ...card, natures: updatedNatures };
        });
    }
    
    // 3. Ajouter les natureErrors aux cards finales
    updatedCards = updatedCards.map((card, index) => ({
        ...card,
        natureErrors: errorsByCard[index] || {}
    }));
    
    return updatedCards;
};

/**
 * Log les résultats pour le debugging
 * @param {Object} result - Résultat complet de l'API
 * @param {Array} targetCards - Les cartes cibles
 * @param {Object} data - Les données traitées
 */
export const logBulkCreateResults = (result, targetCards, data) => {
    console.log('========================================');
    console.log('BULK CREATE - ANALYSIS');
    console.log('========================================');
    console.log('API RESULT:', result);
    console.log('RESULT DATA:', result.data);
    
    if (result.data && result.data.results) {
        console.log('RESULTS ARRAY:', result.data.results);
        console.log('TARGET CARDS:', targetCards);
        
        result.data.results.forEach((targetResult, idx) => {
            console.log(`\n--- Target ${idx} (index ${targetResult.target_index}) ---`);
            console.log('Natures:', targetResult.natures);
            const failedNatures = targetResult.natures.filter(n => !n.success);
            console.log('Failed natures:', failedNatures);
        });
        
        console.log('\nSUMMARY:');
        console.log('Success count:', result.data.success_count);
        console.log('Error count:', result.data.error_count);
        console.log('Targets to remove:', result.data.targets_to_remove);
        console.log('Natures to remove:', result.data.natures_to_remove);
    }
    
    console.log('========================================');
};
