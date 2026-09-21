const textLabels = {
  body: {
    noMatch: "Désolé, aucun élément trouvé",
    toolTip: "Filtrer",
    columnHeaderTooltip: column => `Filtrer pour ${column.label}`,
  },
  pagination: {
    next: "Page suivante",
    previous: "Page précédente",
    rowsPerPage: "Lignes par page:",
    displayRows: "de",
  },
  toolbar: {
    search: "Rechercher",
    downloadCsv: "Télécharger le CSV",
    print: "Imprimer",
    viewColumns: "Afficher les colones",
    filterTable: "Filtrer la table",
  },
  filter: {
    all: "Tous",
    title: "FILTRES",
    reset: "REINITIALISER",
  },
  viewColumns: {
    title: "Afficher les colones",
    titleAria: "Afficher/Cacher les colones de la Table",
  },
  selectedRows: {
    text: "Ligne(s) sélectionnées",
    delete: "Supprimer",
    deleteAria: "Supprimer les lignes sélectionnées",
  },
};

export default textLabels;
