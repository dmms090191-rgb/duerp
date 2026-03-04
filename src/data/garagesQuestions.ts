import { DuerpCategory } from './duerpQuestions';

export const garagesCategories: DuerpCategory[] = [
  {
    id: 'risques_communs_amenagement',
    label: 'Risques communs à toutes les activités',
    displayNumber: '1',
    defaultDescription: 'Vous trouverez dans ce module les risques communs à toutes les activités, qu\'elles portent sur les véhicules légers ou sur les poids lourds.',
    questions: [
      {
        id: 'g1_1_1',
        displayNumber: '1.1.1',
        text: 'Des locaux équipés de vestiaires, des sanitaires avec lavabos et un espace de restauration facilement accessibles sont-ils mis à disposition des salariés ?',
        measures: [
          { id: 'gm1_1_1_1', text: 'Aménager un local nettoyé régulièrement dans lequel les salariés peuvent se changer.' },
          { id: 'gm1_1_1_2', text: 'Équiper ce local de lavabos, de douches et d\'armoires individuelles de type double (vêtements de ville / vêtements de travail).' },
          { id: 'gm1_1_1_3', text: 'Aménager un espace de pause et de restauration, nettoyé régulièrement et équipé d\'un réfrigérateur et d\'une installation permettant de réchauffer des plats.' }
        ],
        informationText: 'Pour limiter les risques liés à l\'utilisation de produits salissants et dangereux, l\'employeur est tenu de mettre à disposition un vestiaire, un espace de restauration et des équipements sanitaires séparés de l\'atelier et du stockage.\nLe lavage fréquent des mains avec un savon professionnel limite l\'exposition cutanée et le risque d\'ingestion d\'agents chimiques dangereux présents dans votre environnement.\nPar ailleurs, un savon microbilles sans solvant limite les risques d\'allergie.'
      },
      {
        id: 'g1_1_2',
        displayNumber: '1.1.2',
        text: 'Les différentes zones de circulation sont-elles définies et matérialisées ?',
        measures: [
          { id: 'gm1_1_2_1', text: 'Définir et matérialiser les voies de circulation ou les zones réservées à la clientèle et celles réservées au personnel.' },
          { id: 'gm1_1_2_2', text: 'Organiser les circuits en évitant et en limitant les croisements avec les voies de circulation des véhicules et de piétons.' },
          { id: 'gm1_1_2_3', text: 'Séparer les circulations des piétons et des véhicules et organiser les zones de stationnement (salariés, clients, véhicules à la vente).' },
          { id: 'gm1_1_2_4', text: 'Équiper les zones de manœuvres des véhicules de dispositifs éliminant les angles morts (miroirs de sécurité), installer si nécessaire un éclairage extérieur.' },
          { id: 'gm1_1_2_5', text: 'Maintenir les lieux d\'accès et de circulation dégagés y compris les sorties de secours.' },
          { id: 'gm1_1_2_6', text: 'Informer et sensibiliser le salarié sur le risque de collision et les mesures permettant de les limiter.' }
        ],
        informationText: 'Il est important de séparer les zones de circulation (intérieures et extérieures) des zones de travail, de stockage et de parcage. Le meilleur aménagement sera recherché en fonction des possibilités.\nLe risque de collision peut être accentué lors du déplacement de véhicules hybrides et électriques circulant silencieusement ou par l\'absence de visibilité due à la présence d\'un bâtiment ou d\'un véhicule faisant écran.'
      },
      {
        id: 'g1_1_3',
        displayNumber: '1.1.3',
        text: 'Le sol est-il en bon état (dégagé, facile à nettoyer, régulièrement entretenu, exempt de trous) ?',
        measures: [
          { id: 'gm1_1_3_1', text: 'Installer des réseaux de câbles suspendus (énergie électrique, pneumatique, etc.) pour limiter la présence de câbles et tuyaux au sol.' },
          { id: 'gm1_1_3_2', text: 'Prévoir des espaces de rangement pour les organes démontés, les pièces en attente et les outils (dessertes, etc.).' },
          { id: 'gm1_1_3_3', text: 'Assurer un nettoyage périodique des sols, en utilisant de préférence un moyen mécanisé.' },
          { id: 'gm1_1_3_4', text: 'Nettoyer immédiatement les salissures au sol (fuites, égouttures, écoulement) avec un produit absorbant minéral en cas de déversement accidentel de liquide.' },
          { id: 'gm1_1_3_5', text: 'Réparer au plus tôt les dégradations du sol pour faciliter les déplacements et les manutentions.' }
        ],
        informationText: 'Les sols encombrés, glissants (flaques d\'huile, dépôts de graisse, etc.) ou en mauvais état occasionnent plus de 20 % des accidents du travail dans votre profession.\nPréférez la pose de revêtements de sol non glissants. Ces dispositions s\'appliquent également à la fosse de visite.'
      },
      {
        id: 'g1_1_4',
        displayNumber: '1.1.4',
        text: 'Les espaces de stockage en hauteur sont-ils protégés ?',
        measures: [
          { id: 'gm1_1_4_1', text: 'Équiper les zones en hauteur d\'une protection périphérique continue (garde-corps, barrière écluse, plinthe, etc.).' },
          { id: 'gm1_1_4_2', text: 'Prévoir un moyen d\'accès sécurisé à la zone en hauteur avec par exemple un escalier (avec rampe) éclairé pour les mezzanines ou une plate-forme roulante sécurisée (PIRL) pour les rayonnages.' },
          { id: 'gm1_1_4_3', text: 'Privilégier le stockage "en roule" accessible de plain-pied pour le stockage des pneumatiques.' },
          { id: 'gm1_1_4_4', text: 'Protéger l\'arrière des rayonnages (plinthes) pour éviter la chute des pièces.' }
        ],
        informationText: 'La mezzanine ou des racks de rangement sont souvent utilisés pour stocker des pièces détachées. Les stockages en hauteur exposent à des risques de chutes d\'objets et de chutes des opérateurs accédant aux rayonnages ou plateformes.\nUne protection périphérique des espaces en hauteur (garde-corps) et des moyens d\'accès sécurisés (escaliers) permettent de prévenir le risque de chute de hauteur. L\'utilisation d\'échelles ou d\'escabeaux n\'est pas adaptée.'
      },
      {
        id: 'g1_1_5',
        displayNumber: '1.1.5',
        text: 'Existe-t-il une zone séparée pour le lavage des véhicules, correctement aménagée ?',
        measures: [
          { id: 'gm1_1_5_1', text: 'Créer une zone de lavage séparée avec un revêtement de sol adapté (non glissant).' },
          { id: 'gm1_1_5_2', text: 'Équiper la zone de lavage d\'une potence pour le flexible du nettoyeur.' },
          { id: 'gm1_1_5_3', text: 'Évacuer vers l\'extérieur les gaz d\'échappement du nettoyeur thermique haute pression.' },
          { id: 'gm1_1_5_4', text: 'Mettre à disposition des salariés des vêtements de travail et des équipements de protection individuelle appropriés.' }
        ],
        informationText: 'Une zone de lavage séparée et bien aménagée (arrivée et évacuation d\'eau, absence de tuyau au sol, évacuation des gaz d\'échappement, etc.) permet de réduire les risques de glissade, de réduire l\'exposition au bruit et aux gaz d\'échappement du nettoyeur haute pression.'
      },
      {
        id: 'g1_1_6',
        displayNumber: '1.1.6',
        text: 'L\'éclairage est-il adapté aux différents travaux réalisés ?',
        measures: [
          { id: 'gm1_1_6_1', text: 'Vérifier le niveau d\'éclairement des différents locaux et des zones de circulation (escaliers...). Les travaux de précision nécessitent un éclairement de 500 à 1000 lux.' },
          { id: 'gm1_1_6_2', text: 'Choisir des éclairages à longue durée de vie et constituer un stock permettant de remplacer les ampoules usagées sans délai.' },
          { id: 'gm1_1_6_3', text: 'Lors de la conception des locaux, privilégiez l\'éclairage naturel (par exemple : châssis vitrés, portes sectionnelles transparentes motorisées, etc.).' }
        ],
        informationText: 'Un éclairage adapté à chaque zone (travail administratif, travail en atelier, stockage, circulation) contribuera à réduire les chutes et facilitera l\'activité. Cet éclairage sera maintenu en bon état de fonctionnement.\nPar exemple, les travaux de précision nécessitent un éclairement de 500 à 1000 lux.'
      },
      {
        id: 'g1_2_1',
        displayNumber: '1.2.1',
        text: 'Avez-vous pris des mesures de protection contre le bruit émis par les machines ?',
        measures: [],
        informationText: ''
      },
      {
        id: 'g1_2_2',
        displayNumber: '1.2.2',
        text: 'Le véhicule à plateau est-il équipé de poignées et marchepied permettant l\'accès en sécurité ?',
        measures: [],
        informationText: ''
      },
      {
        id: 'g1_2_3',
        displayNumber: '1.2.3',
        text: 'Des équipements facilitant la manutention ou la pose des pièces lourdes sont-ils mis à disposition ?',
        measures: [],
        informationText: ''
      },
      {
        id: 'g1_2_4',
        displayNumber: '1.2.4',
        text: 'Les vérifications réglementaires sont-elles effectuées et les éventuelles anomalies sont-elles corrigées ?',
        measures: [],
        informationText: ''
      },
      {
        id: 'g1_3_1',
        displayNumber: '1.3.1',
        text: 'Des mesures de protection sont-elles mises en oeuvre lors de l\'utilisation de produits chimiques ?',
        measures: [],
        informationText: ''
      },
      {
        id: 'g1_3_2',
        displayNumber: '1.3.2',
        text: 'Les instructions relatives à la sécurité sont-elles présentes aux postes de travail ?',
        measures: [],
        informationText: ''
      },
      {
        id: 'g1_3_3',
        displayNumber: '1.3.3',
        text: 'Des mesures ont-elles été prises pour limiter le niveau sonore dans les espaces de travail ?',
        measures: [],
        informationText: ''
      },
      {
        id: 'g1_3_4',
        displayNumber: '1.3.4',
        text: 'Le risque routier dans l\'activité professionnelle est-il pris en compte ?',
        measures: [],
        informationText: ''
      },
      {
        id: 'g1_3_5',
        displayNumber: '1.3.5',
        text: 'La gestion des mécontentements des clients est-elle prise en compte ?',
        measures: [],
        informationText: ''
      },
      {
        id: 'g1_3_6',
        displayNumber: '1.3.6',
        text: 'Un accueil sécurité est-il organisé pour tout nouvel embauché ?',
        measures: [],
        informationText: ''
      },
      {
        id: 'g1_3_7',
        displayNumber: '1.3.7',
        text: 'Existe-t-il une procédure connue pour gérer les situations d\'urgence ?',
        measures: [],
        informationText: ''
      }
    ]
  },
  {
    id: 'reparation_mecanique_vl',
    label: 'Risques liés à l\'activité de réparation mécanique des véhicules légers',
    displayNumber: '2',
    defaultDescription: 'La réparation mécanique couvre les activités de réparation et d\'entretien des véhicules légers.',
    questions: [
      {
        id: 'g2_1',
        displayNumber: '2',
        text: 'Avez-vous une activité de réparation mécanique des véhicules légers ?',
        isYesNoOnly: true,
        measures: [],
        informationText: ''
      },
      {
        id: 'g2_1_1',
        displayNumber: '2.1.1',
        text: 'Les risques liés à l\'utilisation des ponts élévateurs sont-ils maîtrisés ?',
        measures: [
          { id: 'g2_1_1_m1', text: 'Confier la conduite du pont élévateur à du personnel formé.' },
          { id: 'g2_1_1_m2', text: 'S\'assurer du bon état du pont élévateur avant chaque utilisation (état des câbles et des patins) et du bon emplacement des points de levage du véhicule. Effectuer un essai en poussant le véhicule après une élévation de faible hauteur.' },
          { id: 'g2_1_1_m3', text: 'Rédiger une fiche de poste reprenant toutes les consignes d\'utilisation de l\'appareil de levage.' }
        ],
        informationText: 'Même s\'il est préférable au travail dans la fosse, l\'utilisation d\'un pont élévateur peut être à l\'origine d\'accidents (basculement ou chute du véhicule, chute de pièces, écrasement de l\'opérateur). Un entretien préventif régulier est indispensable. La vérification périodique des ponts et la formation des salariés sont obligatoires.\nDes fiches de poste sont disponibles sur le site inrs.fr'
      },
      {
        id: 'g2_1_2',
        displayNumber: '2.1.2',
        text: 'Des équipements sont-ils mis à disposition pour faciliter le travail sous le pont élévateur ?',
        measures: [
          { id: 'g2_1_2_m1', text: 'Ajuster la hauteur du pont élévateur en fonction de la taille de l\'opérateur.' },
          { id: 'g2_1_2_m2', text: 'Utiliser des rallonges aux outils manuels et pneumatiques pour éviter la fatigue des membres supérieurs.' },
          { id: 'g2_1_2_m3', text: 'Utiliser les équipements complémentaires d\'aide à la manutention (vérin de soutien d\'organes, vérin de fosse, récupérateur d\'huile sur roulettes, dessertes roulantes, etc.).' }
        ],
        informationText: 'L\'utilisation d\'un pont élévateur peut entraîner pour l\'opérateur des postures contraignantes (flexion du dos, par exemple) à l\'origine de troubles musculo-squelettiques (TMS) comme les douleurs dans les épaules, les coudes, ou les poignets et des maux de dos. Une organisation du travail prévoyant des temps de pose permet de réduire l\'apparition des douleurs. Des équipements permettent de réduire le risque : container de récupération des huiles sur roulettes, etc.'
      },
      {
        id: 'g2_1_3',
        displayNumber: '2.1.3',
        text: 'Les fosses de visite ou de réparation ont-elles été supprimées ?',
        measures: [
          { id: 'g2_1_3_m1', text: 'Remplacer la fosse de visite par un pont élévateur et la condamner. Dans l\'attente de la suppression, aménager la fosse suivant la recommandation R468 de la CNAMTS.' }
        ],
        informationText: 'Les fosses de visites présentent de nombreux dangers : chute de hauteur, chute de plain-pied, chute du véhicule, heurts à la tête, intoxication due aux polluants accumulés en fosse, incendie et explosion, pénibilité liée à l\'absence de réglage de hauteur, etc.\nLa recommandation R 468 "Recommandation pour l\'utilisation, l\'aménagement et la rénovation des fosses de visite pour véhicules et engins" précise les mesures de prévention.'
      },
      {
        id: 'g2_1_4',
        displayNumber: '2.1.4',
        text: 'Le véhicule est-il systématiquement calé avec des chandelles après avoir été surélevé au moyen d\'un cric ?',
        measures: [
          { id: 'g2_1_4_m1', text: 'Après avoir vérifié la capacité du cric, l\'utiliser sur un sol nivelé et le placer de sorte que le véhicule ne puisse pas se déplacer.' },
          { id: 'g2_1_4_m2', text: 'Caler le véhicule avec des chandelles.' },
          { id: 'g2_1_4_m3', text: 'Mettre à disposition un chariot de visite et des lunettes de protection.' }
        ],
        informationText: 'Les crics (mécaniques, hydrauliques ou pneumatiques) permettent de soulever rapidement les véhicules. Toutefois, le basculement du cric ou le déplacement du véhicule surélevé expose l\'opérateur à un risque d\'écrasement. Il est préférable d\'utiliser des ponts élévateurs.'
      },
      {
        id: 'g2_2_1',
        displayNumber: '2.2.1',
        text: 'Le pot d\'échappement est-il raccordé à un système d\'extraction lors des interventions avec moteur en marche ?',
        measures: [
          { id: 'gm2_2_1_1', text: 'Installer un dispositif d\'aspiration des gaz d\'échappement avec rejet à l\'extérieur, facilement utilisable (enrouleur ou rail) et veiller à son utilisation systématique.' },
          { id: 'gm2_2_1_2', text: 'Ne pas laisser le moteur tourner inutilement.' }
        ],
        informationText: 'Les gaz d\'échappement contiennent notamment des oxydes de carbone et d\'azote, des hydrocarbures imbrûlés et des particules fines. Ils ont des effets graves sur la santé à court, moyen ou long terme. Les émissions des échappements des moteurs diesel sont classées cancérogènes, elles peuvent pénétrer dans les bronches et les alvéoles pulmonaires et provoquer des affections respiratoires et cardiovasculaires.'
      },
      {
        id: 'g2_2_2',
        displayNumber: '2.2.2',
        text: 'Les contacts cutanés et respiratoires sont-ils évités (gasoil, huile, carburant, liquide de refroidissement, etc.) ?',
        measures: [
          { id: 'gm2_2_2_1', text: 'Privilégier la vidange par aspiration à la vidange par gravité.' },
          { id: 'gm2_2_2_2', text: 'Récupérer les fluides dans des fûts étanches adaptés et les stocker si nécessaire sur des bacs de rétention.' },
          { id: 'gm2_2_2_3', text: 'Limiter au maximum l\'égouttage des filtres à huile et à combustible dans la zone de travail, pour réduire les émanations.' },
          { id: 'gm2_2_2_4', text: 'Privilégier la distribution des fluides par dispositif centralisé.' },
          { id: 'gm2_2_2_5', text: 'Porter des gants jetables et une tenue de travail adaptée.' }
        ],
        informationText: 'L\'exposition aux huiles de vidange, aux carburants et aux différents fluides peut provoquer des maladies de la peau (dermatoses) et des cancers. Eviter les contacts ou se protéger permet de réduire ce risque.'
      },
      {
        id: 'g2_2_3',
        displayNumber: '2.2.3',
        text: 'L\'exposition aux poussières lors des travaux sur les freins ou embrayages est-elle maîtrisée ?',
        measures: [
          { id: 'gm2_2_3_1', text: 'Interdire l\'usage de la soufflette.' },
          { id: 'gm2_2_3_2', text: 'Fournir des pulvérisateurs d\'agents mouillants ou des fontaines mobiles de nettoyage en phase aqueuse ou du nettoyant frein sans n-hexane.' },
          { id: 'gm2_2_3_3', text: 'Porter des gants nitriles jetables et un masque adapté (masque FFP3) si suspicion de présence d\'amiante.' },
          { id: 'gm2_2_3_4', text: 'Privilégier l\'aspiration des poussières au balayage.' }
        ],
        informationText: 'Les travaux sur les dispositifs de freinage et d\'embrayage dégagent des poussières nocives. Ces poussières provoquent des maladies respiratoires (fibroses pulmonaires) et des cancers (cancers de la plèvre et cancers broncho-pulmonaires). Les équipements et procédés utilisés doivent privilégier soit l\'aspiration des poussières, soit la voie humide pour éviter la diffusion des poussières.'
      },
      {
        id: 'g2_2_4',
        displayNumber: '2.2.4',
        text: 'Avez-vous pris des mesures pour limiter le risque de blessure aux mains ?',
        measures: [
          { id: 'gm2_2_4_1', text: 'Utiliser des outils adaptés pour le montage et le démontage des pièces mécaniques, afin de supprimer le risque de ripage des outils.' },
          { id: 'gm2_2_4_2', text: 'Utiliser des gants de protection contre les risques mécaniques pour le montage ou le démontage des pièces difficilement accessibles.' }
        ],
        informationText: 'L\'activité de réparation présente des risques de coupure, écrasement, pincement et sectionnement au niveau des mains. Le montage et le démontage des roues et des pneus sont également concernés. Des outils adaptés et des gants de protection permettent de réduire le risque de blessure aux mains.'
      },
      {
        id: 'g2_3_1',
        displayNumber: '2.3.1',
        text: 'La charge et le stockage des batteries sont-ils effectués dans des locaux appropriés (zones dédiées, ventilées, à l\'abri d\'étincelle) ?',
        measures: [
          { id: 'gm2_3_1_1', text: 'Isoler la zone de stockage et de charge dans un endroit ventilé, à l\'abri des étincelles et à l\'écart des produits inflammables.' },
          { id: 'gm2_3_1_2', text: 'Mettre à disposition une douche oculaire en cas de contact avec les yeux.' },
          { id: 'gm2_3_1_3', text: 'Porter des gants nitrile, des lunettes de protection et une tenue de travail adaptée.' },
          { id: 'gm2_3_1_4', text: 'Stocker les batteries sur bac de rétention.' }
        ],
        informationText: 'Des risques, tels que les brûlures chimiques (par l\'électrolyte ou l\'acide sulfurique), le port de charges lourdes ou l\'électrisation doivent être pris en compte lors des opérations d\'enlèvement, de pose et de charge des batteries. En contact avec l\'air ambiant, l\'hydrogène dégagé lors de la charge des batteries, peut être à l\'origine d\'explosions.',
        hasNotApplicable: true
      },
      {
        id: 'g2_3_2',
        displayNumber: '2.3.2',
        text: 'Avez-vous supprimé l\'usage des solvants (ou carburant) pour dégraisser ?',
        measures: [
          { id: 'gm2_3_2_1', text: 'Supprimer l\'usage de solvant ou de carburant pour le nettoyage des pièces et pour le lavage des mains.' },
          { id: 'gm2_3_2_2', text: 'Utiliser une fontaine de nettoyage sans solvant (biologique à bactéries ou à défaut agent lessiviel).' },
          { id: 'gm2_3_2_3', text: 'Utiliser des gants de protection.' }
        ],
        informationText: 'Que ce soit par trempage ou arrosage ou pulvérisation, le nettoyage et le dégraissage des pièces (ou des mains) peut exposer les opérateurs à des produits nocifs (hydrocarbures halogénés, solvants). Par contact avec la peau, par inhalation ou ingestion ces produits peuvent provoquer des pathologies touchant le système nerveux, la peau, le foie, etc.'
      },
      {
        id: 'g2_4_1',
        displayNumber: '2.4.1',
        text: 'Des mesures de protection ont-elles été prises sur les équilibreuses et des démonte-pneus ?',
        measures: [
          { id: 'gm2_4_1_1', text: 'Privilégier le matériel d\'équilibrage à vitesse lente.' },
          { id: 'gm2_4_1_2', text: 'Privilégier les démonte-pneus avec l\'option « troisième main ».' },
          { id: 'gm2_4_1_3', text: 'Installer un système de levage associé au démonte-pneu. Il doit être doté de rouleaux pour faciliter la rotation de la roue lors du détalonnage du pneu.' },
          { id: 'gm2_4_1_4', text: 'Installer un système de levage associé à l\'équilibreuse pour amener la roue au niveau de l\'axe de l\'équilibreuse.' },
          { id: 'gm2_4_1_5', text: 'Utiliser un lève-roue mobile pour déplacer les roues entre les divers équipements et les mettre à niveau sans les porter manuellement.' },
          { id: 'gm2_4_1_6', text: 'Rédiger une fiche de poste reprenant toutes les consignes d\'utilisation de l\'équilibreuse et du démonte-pneu.' },
          { id: 'gm2_4_1_7', text: 'Former les salariés à l\'utilisation des aides à la manutention mises à leur disposition.' }
        ],
        informationText: 'Le montage et le démontage des roues et des pneus présentent des risques de coupure, écrasement, pincement et sectionnement au niveau des mains.\nLa mise en rotation des roues lors de l\'équilibrage présente des risques de projection de gravier, masselotte, etc. La manutention des pneus est également source de contraintes physiques importantes.\nPour en savoir plus consultez la fiche ED 6474 : "Limiter le recours aux manutentions manuelles lors des interventions sur les pneumatiques".'
      },
      {
        id: 'g2_4_2',
        displayNumber: '2.4.2',
        text: 'Votre presse d\'atelier est-elle équipée d\'un écran de protection ?',
        measures: [
          { id: 'gm2_4_2_1', text: 'Équiper la presse d\'un écran de protection.' },
          { id: 'gm2_4_2_2', text: 'Confier l\'utilisation des machines à du personnel formé.' },
          { id: 'gm2_4_2_3', text: 'Rédiger une fiche de poste reprenant toutes les consignes d\'utilisation de la presse.' }
        ],
        informationText: 'Les presses d\'atelier non protégées (sans écran de protection) exposent les opérateurs à deux types de dangers : projection ou éjection de pièces, et accès à la zone de pressage, pouvant entraîner des accidents graves, voire mortels.'
      },
      {
        id: 'g2_4_3',
        displayNumber: '2.4.3',
        text: 'Avez-vous pris un dispositif évitant ou limitant le risque d\'éjection du ressort ?',
        measures: [
          { id: 'gm2_4_3_1', text: 'Privilégier les systèmes avec protection intégrée contre les risques d\'éjection.' },
          { id: 'gm2_4_3_2', text: 'Confier l\'utilisation des machines à du personnel formé.' },
          { id: 'gm2_4_3_3', text: 'Rédiger une fiche de poste reprenant toutes les consignes d\'utilisation de l\'équipement de compression du ressort.' }
        ],
        informationText: 'Lors de la compression, l\'éjection du ressort peut entraîner des blessures graves.'
      }
    ]
  },
  {
    id: 'carrosserie_vl',
    label: 'Risques liés à l\'activité de carrosserie des véhicules légers',
    displayNumber: '3',
    defaultDescription: 'La carrosserie regroupe les activités de tôlerie, soudage et peinture. Les principaux risques sont liés à l\'exposition à des produits chimiques et à la poussière. Ils sont aussi liés au travail à genoux. Le risque d\'incendie/explosion est associé au soudage.',
    questions: [
      {
        id: 'g3_1',
        displayNumber: '3',
        text: 'Avez vous une activité de carrosserie sur véhicule léger ?',
        isYesNoOnly: true,
        yesNoQuestion: 'Avez vous une activité de carrosserie sur véhicule léger ?',
        measures: [],
        informationText: ''
      },
      {
        id: 'g3_1_1',
        displayNumber: '3.1.1',
        text: 'Avez-vous pris des mesures de protection contre l\'inhalation des poussières de ponçage ?',
        measures: [
          { id: 'gm3_1_1_1', text: 'S\'équiper de ponceuses à aspiration intégrée, raccordées de préférence à une centrale d\'aspiration haute dépression avec filtration et rejet extérieur, ou à défaut à un aspirateur individuel.' },
          { id: 'gm3_1_1_2', text: 'Privilégier l\'utilisation de disques micro perforés.' },
          { id: 'gm3_1_1_3', text: 'Réaliser les opérations de ponçage dans des aires de préparation dédiées équipées de caillebotis aspirants.' },
          { id: 'gm3_1_1_4', text: 'S\'équiper d\'une installation répondant aux règles de prévention du risque incendie-explosion, notamment en cas de ponçage de pièces ou carrosserie en aluminium.' }
        ],
        informationText: 'Les poussières de ponçage sont nocives pour l\'appareil respiratoire, leur captation limite le risque d\'inhalation. Le ponçage de pièces en aluminium présente un risque d\'explosion. Des équipements permettent de limiter l\'émission de poussières.'
      },
      {
        id: 'g3_1_2',
        displayNumber: '3.1.2',
        text: 'Les postures de travail à genoux sont-elles évitées ?',
        measures: [
          { id: 'gm3_1_2_1', text: 'Installer un équipement de mise à niveau du véhicule (table élévatrice, colonne hydraulique de levage, etc.).' },
          { id: 'gm3_1_2_2', text: 'Mettre à disposition des tabourets sur roulettes.' },
          { id: 'gm3_1_2_3', text: 'Mettre à disposition des protecteurs de genoux, de préférence intégrés au vêtement de travail.' }
        ],
        informationText: 'Les travaux en bas de caisse nécessitent un travail à genoux, accroupi ou penché si aucun dispositif de mise à niveau du véhicule n\'est utilisé. Ces postures sont très contraignantes pour le corps humain et peuvent être à l\'origine de troubles musculo-squelettiques (TMS).'
      },
      {
        id: 'g3_1_3',
        displayNumber: '3.1.3',
        text: 'Le masticage est-il effectué dans une zone ventilée ?',
        measures: [
          { id: 'gm3_1_3_1', text: 'Réaliser la préparation du masticage dans une zone ventilée (ex. : dans le laboratoire de peinture).' },
          { id: 'gm3_1_3_2', text: 'Appliquer et laisser sécher le mastic dans une zone ventilée (cabine horizontale, cabine verticale, caillebotis aspirant, etc.).' },
          { id: 'gm3_1_3_3', text: 'Mettre à disposition des équipements de protection individuelle (masques, gants, combinaison, etc.) adaptés.' },
          { id: 'gm3_1_3_4', text: 'Stocker les masques à l\'abri des solvants et des poussières.' }
        ],
        informationText: 'La préparation, la pose et le séchage du mastic exposent au risque chimique par contact et par inhalation, entraînant diverses pathologies : eczéma, asthme, etc.'
      }
    ]
  },
  {
    id: 'reparation_poids_lourds',
    label: 'Risques liés à l\'activité de réparation des poids lourds',
    displayNumber: '4',
    defaultDescription: 'Ce module traite des activités de réparation mécanique et de carrosserie sur les poids lourds. L\'intervention sur ces véhicules présente des spécificités et nécessite des équipements particuliers.',
    questions: [
      {
        id: 'g4_1',
        displayNumber: '4',
        text: 'Avez vous une activité de réparation mécanique ou carrosserie pour les poids lourds ?',
        isYesNoOnly: true,
        measures: [],
        informationText: ''
      },
      {
        id: 'g4_1_1',
        displayNumber: '4.1.1',
        text: 'Les risques liés à l\'utilisation des ponts élévateurs sont-ils maîtrisés ?',
        measures: [
          { id: 'gm4_1_1_1', text: 'Confier la conduite du pont élévateur à du personnel formé.' },
          { id: 'gm4_1_1_2', text: 'S\'assurer du bon état du pont et du bon calage des véhicules.' },
          { id: 'gm4_1_1_3', text: 'Rédiger une fiche de poste pour le pont élévateur.' }
        ],
        informationText: 'Même s\'il est préférable au travail dans la fosse, l\'utilisation d\'un pont élévateur peut être à l\'origine d\'accidents (basculement ou chute du véhicule, chute de pièces, écrasement de l\'opérateur). La vérification périodique des ponts et la formation des salariés sont obligatoires. Des fiches de postes sont disponibles sur le site inrs.fr'
      },
      {
        id: 'g4_1_2',
        displayNumber: '4.1.2',
        text: 'Des équipements sont-ils mis à disposition pour faciliter le travail sous le pont élévateur ?',
        measures: [
          { id: 'gm4_1_2_1', text: 'Ajuster la hauteur du pont élévateur en fonction de la taille de l\'opérateur.' },
          { id: 'gm4_1_2_2', text: 'Utiliser des rallonges aux outils manuels et pneumatiques pour éviter la fatigue des membres supérieurs.' },
          { id: 'gm4_1_2_3', text: 'Utiliser les équipements complémentaires d\'aide à la manutention (vérin de soutien d\'organes, vérin de fosse, récupérateur d\'huile sur roulettes, dessertes roulantes, etc.).' }
        ],
        informationText: 'L\'utilisation d\'un pont élévateur peut entraîner pour l\'opérateur des postures contraignantes (flexion du dos, par exemple) à l\'origine de troubles musculo-squelettiques (TMS) comme les douleurs dans les épaules, les coudes, ou les poignets et des maux de dos.'
      },
      {
        id: 'g4_1_3',
        displayNumber: '4.1.3',
        text: 'La fosse est-elle aménagée pour limiter les efforts physiques importants ?',
        measures: [
          { id: 'gm4_1_3_1', text: 'Incorporer des équipements et aménagements dans la structure de la fosse (niches dans les parois) pour mettre l\'outillage à hauteur et éviter les obstacles en fond de fosse.' },
          { id: 'gm4_1_3_2', text: 'Prévoir des équipements limitant les efforts physiques (vérins de fosse, vérins de bord de fosse).' },
          { id: 'gm4_1_3_3', text: 'Pour les vérins de fosse, aménager un rail de guidage.' }
        ],
        informationText: 'Le travail dans les fosses implique des postures de travail difficiles qui peuvent être à l\'origine de troubles musculosquelettiques (TMS) ou d\'accidents du travail.'
      },
      {
        id: 'g4_1_4',
        displayNumber: '4.1.4',
        text: 'Y a-t-il un dispositif d\'aspiration d\'air pollué en fond de fosse ?',
        measures: [
          { id: 'gm4_1_4_1', text: 'Assurer le renouvellement d\'air pollué en fond de fosse.' },
          { id: 'gm4_1_4_2', text: 'Lors de la conception d\'une fosse, prévoir un dispositif d\'aspiration d\'air pollué.' }
        ],
        informationText: 'L\'accumulation de gaz et vapeurs en fond de fosse expose les opérateurs à des produits qui peuvent être nocifs pour le système respiratoire, cancérogènes ou toxiques pour la reproduction.\n\nDans le cas de la réalisation d\'une nouvelle fosse, la recommandation R469 de la Cnam vous apporte des éléments pour le cahier des charges.'
      },
      {
        id: 'g4_1_5',
        displayNumber: '4.1.5',
        text: 'Des mesures contre les risques d\'explosion et d\'incendie sont-elles prises ?',
        measures: [
          { id: 'gm4_1_5_1', text: 'Choisir des matériaux conçus pour une utilisation en atmosphère explosive (éclairage antidéflagrant, etc.).' },
          { id: 'gm4_1_5_2', text: 'Privilégier l\'utilisation de matériels portatifs sans fil.' },
          { id: 'gm4_1_5_3', text: 'Ne pas introduire de flamme nue dans la fosse.' },
          { id: 'gm4_1_5_4', text: 'Installer un extincteur à chaque extrémité de la fosse.' },
          { id: 'gm4_1_5_5', text: 'S\'assurer que la fosse est équipée d\'un accès à chaque extrémité et que l\'un d\'eux est considéré comme un escalier de secours. L\'accès de secours peut être assuré par une échelle fixée dans la structure de la fosse.' }
        ],
        informationText: 'Les produits inflammables et explosifs peuvent s\'accumuler en fond de fosse. La présence de flammes ou d\'étincelles en fond de fosse ou à proximité peut être à l\'origine d\'incendies ou d\'explosions.'
      },
      {
        id: 'g4_1_6',
        displayNumber: '4.1.6',
        text: 'Utilisez-vous un dispositif de calage lors des opérations sous la cabine ou la benne basculée ?',
        measures: [
          { id: 'gm4_1_6_1', text: 'Utiliser un dispositif de calage pour éviter une retombée intempestive (barre de calage, accroche en hauteur, chandelle...).' }
        ],
        informationText: 'Des accidents graves se sont produits à cause d\'un mauvais calage de la cabine basculée ou de la benne.'
      },
      {
        id: 'g4_2_1',
        displayNumber: '4.2.1',
        text: 'Utilisez-vous des plates-formes individuelles roulantes lors du travail en hauteur (ou des échafaudages) ?',
        measures: [
          'Utiliser des échafaudages roulants ou des plateformes individuelles roulantes (PIRL).',
          'Pour les gros travaux, équiper les installations d\'une plateforme de travail stable et de garde-corps périphériques.'
        ],
        informationText: 'L\'intervention sur véhicule nécessite souvent un travail en hauteur : n\'utiliser à cette fin que des échafaudages roulants ou des plates-formes individuelles roulantes (PIR/PIRL) conformes aux normes en vigueur (marque NF).\nA défaut, si d\'autres équipements de travail en hauteur sont utilisés (notamment des équipements spécifiques adaptés), ils doivent être stables et présenter un plan de travail, accessible de manière sûre, munis d\'une protection collective.'
      },
      {
        id: 'g4_2_2',
        displayNumber: '4.2.2',
        text: 'L\'accès aux différentes cabines est-il effectué en sécurité ?',
        measures: [
          'Pour les véhicules dont l\'accès à la cabine est équipé de poignées de maintien et marchepied, rappeler les consignes pour toujours utiliser trois points d\'appui.',
          'Si l\'accès à la cabine ne permet pas l\'utilisation de trois points d\'appui, utiliser une plate-forme individuelle roulante.'
        ],
        informationText: 'Monter ou descendre de la cabine (ou du plateau) du camion est à l\'origine de nombreux accidents : entorse, fracture, etc.\nLa présence de trois points d\'appui permet de réduire ce risque.'
      },
      {
        id: 'g4_3_1',
        displayNumber: '4.3.1',
        text: 'Le pot d\'échappement est-il raccordé à un système d\'extraction lors des interventions avec moteur tournant ?',
        measures: [
          { id: 'gm4_3_1_1', text: 'Installer un dispositif d\'aspiration des gaz d\'échappement avec rejet à l\'extérieur, facilement utilisable (enrouleur ou rail) et veiller à son utilisation systématique.' },
          { id: 'gm4_3_1_2', text: 'Ne pas laisser le moteur tourner inutilement.' }
        ],
        informationText: 'Les gaz d\'échappement contiennent notamment des oxydes de carbone et d\'azote et des particules fines. Ils peuvent provoquer, immédiatement ou à long terme, une intoxication au monoxyde de carbone (fatigue, maux de tête, vertiges, nausées, perte de connaissance). Les particules diesel peuvent pénétrer dans les bronches et les alvéoles pulmonaires et provoquer des affections respiratoires et cardiovasculaires. Il existe un risque accru de cancer du poumon (produit reconnu comme cancérogène).'
      },
      {
        id: 'g4_3_2',
        displayNumber: '4.3.2',
        text: 'Les contacts cutanés et respiratoires sont-ils évités (gasoil, huile, carburant, liquide de refroidissement, etc.) ?',
        measures: [
          { id: 'gm4_3_2_1', text: 'Privilégier la vidange par aspiration à la vidange par gravité.' },
          { id: 'gm4_3_2_2', text: 'Récupérer les fluides dans des fûts étanches adaptés et les stocker si nécessaire sur des bacs de rétention.' },
          { id: 'gm4_3_2_3', text: 'Limiter au maximum l\'égouttage des filtres à huile et à combustible dans la zone de travail, pour réduire les émanations.' },
          { id: 'gm4_3_2_4', text: 'Privilégier la distribution des fluides par dispositif centralisé.' },
          { id: 'gm4_3_2_5', text: 'Porter des gants jetables et une tenue de travail adaptée.' }
        ],
        informationText: 'L\'exposition aux huiles de vidange, aux carburants et aux différents fluides peut provoquer des maladies de la peau (dermatoses) et des cancers. Eviter les contacts ou se protéger permet de réduire ce risque.'
      },
      {
        id: 'g4_3_3',
        displayNumber: '4.3.3',
        text: 'L\'exposition aux poussières lors des travaux sur les freins ou embrayages est-elle maîtrisée ?',
        measures: [
          { id: 'gm4_3_3_1', text: 'Interdire l\'usage de la soufflette.' },
          { id: 'gm4_3_3_2', text: 'Fournir des pulvérisateurs d\'agents mouillants ou des fontaines mobiles de nettoyage en phase aqueuse ou du nettoyant frein sans n-hexane.' },
          { id: 'gm4_3_3_3', text: 'Porter des gants nitriles jetables et un masque adapté (masque FFP3) si suspicion de présence d\'amiante.' },
          { id: 'gm4_3_3_4', text: 'Privilégier l\'aspiration des poussières au balayage.' }
        ],
        informationText: 'Les travaux sur les dispositifs de freinage et d\'embrayage dégagent des poussières nocives. Ces poussières provoquent des maladies respiratoires (fibroses pulmonaires) et des cancers (cancers de la plèvre et cancers broncho-pulmonaires). Les équipements et procédés utilisés doivent privilégier soit l\'aspiration des poussières, soit la voie humide pour éviter la diffusion des poussières.'
      },
      {
        id: 'g4_3_4',
        displayNumber: '4.3.4',
        text: 'Avez-vous pris en compte le risque de blessure aux mains ?',
        measures: [
          { id: 'gm4_3_4_1', text: 'Utiliser des outils adaptés pour le montage et le démontage des pièces mécaniques, afin de supprimer le risque de ripage des outils.' },
          { id: 'gm4_3_4_2', text: 'Utiliser des gants de protection contre les risques mécaniques pour le montage ou le démontage des pièces difficilement accessibles.' }
        ],
        informationText: 'L\'activité de réparation présente des risques de coupure, écrasement, pincement et sectionnement au niveau des mains. Des outils adaptés et des gants de protection permettent de réduire le risque de blessure aux mains.'
      },
      {
        id: 'g4_3_5',
        displayNumber: '4.3.5',
        text: 'Le risque d\'éclatement du pneu est-il pris en compte ?',
        measures: [
          { id: 'gm4_3_5_1', text: 'Effectuer sur pneu dégonflé un diagnostic visuel systématique intérieur et extérieur permettant de détecter des anomalies (ex. : marbrures, craquelures, déformations de la carcasse, hernies).' },
          { id: 'gm4_3_5_2', text: 'Utiliser une cage de gonflage.' },
          { id: 'gm4_3_5_3', text: 'Rester éloigné du pneu. Ne jamais se placer face à la roue ni au-dessus d\'elle.' },
          { id: 'gm4_3_5_4', text: 'S\'assurer de ne jamais dépasser la pression préconisée.' },
          { id: 'gm4_3_5_5', text: 'Ne jamais effectuer de soudure sur une jante si le pneu n\'est pas démonté.' }
        ],
        informationText: 'Les pneus sous pression des véhicules de grandes dimensions renferment une énorme quantité d\'énergie. De mauvaises méthodes de manipulation et de montage des pneus et des roues peuvent provoquer une explosion, et engendrer ainsi des dommages coûteux, des blessures graves, voire la mort.'
      },
      {
        id: 'g4_4_1',
        displayNumber: '4.4.1',
        text: 'Les pourtours des fosses de visite sont-ils sécurisés ?',
        measures: [
          'Baliser et entourer les fosses de visite d\'un garde-corps solide ou d\'une barrière relevable.',
          'Recouvrir les fosses quand elles ne sont pas utilisées (couverture souple ou rigide) et proscrire le stockage sur le dispositif de protection sauf spécification contraire.'
        ],
        informationText: 'De nombreuses chutes sont constatées lors de la circulation aux abords des fosses ou lors d\'interventions sur le véhicule depuis le bord de la fosse. De façon générale, il est préférable de disposer de ponts élévateurs plutôt que de fosses de visite.'
      },
      {
        id: 'g4_4_2',
        displayNumber: '4.4.2',
        text: 'La charge et le stockage des batteries sont-ils effectués dans des locaux appropriés (zones dédiées, ventilées, à l\'abri d\'étincelle) ?',
        measures: [
          'Isoler la zone de stockage et de charge dans un endroit ventilé, à l\'abri des étincelles et à l\'écart des produits inflammables.',
          'Mettre à disposition une douche oculaire en cas de contact avec les yeux.',
          'Porter des gants nitrile, des lunettes de protection et une tenue de travail adaptée.',
          'Stocker les batteries sur un bac de rétention.'
        ],
        informationText: 'Des risques, tels que les brûlures chimiques (par l\'électrolyte ou l\'acide sulfurique) et le port de charges lourdes, doivent être pris en compte lors des opérations d\'enlèvement, de pose et de charge des batteries. En contact avec l\'air ambiant, l\'hydrogène dégagé lors de la charge des batteries, peut être à l\'origine d\'explosions.'
      },
      {
        id: 'g4_4_3',
        displayNumber: '4.4.3',
        text: 'Avez-vous supprimé l\'usage des solvants (ou carburant) pour dégraisser ?',
        measures: [
          'Supprimer l\'usage de solvant ou de carburant pour le nettoyage des pièces et pour le lavage des mains.',
          'Utiliser une fontaine de nettoyage sans solvant (biologique à bactéries ou à défaut agent lessiviel).',
          'Utiliser des gants de protection.'
        ],
        informationText: 'Que ce soit par trempage ou arrosage ou pulvérisation, le nettoyage et le dégraissage des pièces (ou des mains) peut exposer les opérateurs à des produits nocifs (hydrocarbures halogénés, solvants) qui par contact avec la peau, par inhalation ou ingestion peuvent provoquer des pathologies touchant le système nerveux, la peau, le foie, etc.'
      },
      {
        id: 'g4_4_4',
        displayNumber: '4.4.4',
        text: 'Des dispositions ont-elles été prises pour réduire l\'activité physique des opérateurs ?',
        measures: [
          'Aménager un espace suffisant de travail pour permettre aux mécaniciens de regrouper autour d\'eux les outils nécessaires et pouvoir travailler dans des positions corporelles acceptables.',
          'Envisager des postes de travail réglables en hauteur.',
          'Fournir des aides techniques à la manutention adaptées aux pièces des poids lourds (support roulant de boîte de vitesse, chariot manipulateur de pare-brise, appareil facilitant la dépose et la manutention des roues, voire pont roulant, etc.) pour le transport manuel de charges supérieures à 25 kg (valeur maximale sous conditions).'
        ],
        informationText: 'Les manutentions manuelles restent la première cause d\'accidents du travail. Elles sollicitent tous les membres et le dos pour déplacer, transporter, soulever, manipuler, tirer-pousser une charge, et de ce fait peuvent générer, à moyen ou long terme, des troubles musculosquelettiques (TMS). Pour diminuer ces manutentions et leurs conséquences physiques, différentes mesures de prévention peuvent être mises en place.'
      },
      {
        id: 'g4_4_5',
        displayNumber: '4.4.5',
        text: 'L\'accès à la zone dangereuse du freinomètre est-il protégé ?',
        measures: [
          'Mettre en place des moyens de protection de l\'accès au freinomètre au niveau du sol (dispositif mécanique, barrière immatérielle, tapis sensible ou garde-corps) et de l\'accès par la fosse.',
          'Informer et former les opérateurs à l\'utilisation correcte du freinomètre.'
        ],
        informationText: 'En l\'absence de dispositifs de protection depuis le sol et depuis la fosse, les opérateurs et les personnes à proximité des bancs d\'essais de freinage sont exposés à des risques de coincement, happement, écrasement entre les rouleaux, ou entre les rouleaux et les roues du véhicule. Des accidents graves, voire mortels peuvent en résulter. Les dispositifs de protection doivent être installés au niveau du sol et de la fosse.'
      },
      {
        id: 'g4_5_1',
        displayNumber: '4.5.1',
        text: 'Les risques lors de l\'utilisation des équilibreuses et des démonte-pneus sont-ils pris en compte ?',
        measures: [
          'Privilégier le matériel d\'équilibrage à vitesse lente.',
          'Privilégier les démonte-pneus avec l\'option « troisième main ».',
          'Installer un système de levage associé au démonte-pneu. Il doit être doté de rouleaux pour faciliter la rotation de la roue lors du détalonnage du pneu.',
          'Installer un système de levage associé à l\'équilibreuse pour amener la roue au niveau de l\'axe de l\'équilibreuse.',
          'Utiliser un lève-roue mobile pour déplacer les roues entre les divers équipements et les mettre à niveau sans les porter manuellement.',
          'Rédiger une fiche de poste reprenant toutes les consignes d\'utilisation de l\'équilibreuse et du démonte-pneus.',
          'Former les salariés à l\'utilisation des aides à la manutention mises à leur disposition.'
        ],
        informationText: 'Le montage et le démontage des roues et des pneus présentent des risques de coupure, écrasement, pincement et sectionnement au niveau des mains.\nLa mise en rotation des roues lors de l\'équilibrage présente des risques de projection de gravier, masselotte, etc. La manutention des pneus est également source de contraintes physiques importantes.\nPour en savoir plus consultez la fiche : Limiter le recours aux manutentions manuelles lors des interventions sur les pneumatiques.'
      },
      {
        id: 'g4_5_2',
        displayNumber: '4.5.2',
        text: 'Votre presse d\'atelier est-elle équipée d\'un écran de protection ?',
        measures: [
          'Équiper la presse d\'un écran de protection.',
          'Confier l\'utilisation des machines à du personnel formé.',
          'Rédiger une fiche de poste reprenant toutes les consignes d\'utilisation de la presse.'
        ],
        informationText: 'Les presses d\'atelier non protégées exposent les opérateurs à deux types de dangers : projection ou éjection de pièces, et accès à la zone de pressage, pouvant entraîner des accidents graves, voire mortels'
      },
      {
        id: 'g4_5_3',
        displayNumber: '4.5.3',
        text: 'Avez-vous pris en compte le risque d\'éjection du ressort lors d\'une intervention sur les systèmes de suspension ?',
        measures: [
          'Privilégier les systèmes avec protection intégrée contre les risques d\'éjection.',
          'Confier l\'utilisation des machines à du personnel formé.',
          'Rédiger une fiche de poste reprenant toutes les consignes d\'utilisation de l\'équipement de compression du ressort.'
        ],
        informationText: 'Lors de la compression, l\'éjection du ressort peut entraîner des blessures graves.'
      },
      {
        id: 'g4_5_4',
        displayNumber: '4.5.4',
        text: 'Des mesures de protection ont-elles été prises sur les équilibreuses et les démonte-pneus ?',
        measures: [
          'Privilégier le matériel d\'équilibrage à vitesse lente.',
          'Privilégier les démonte-pneus avec l\'option « troisième main ».',
          'Installer un système de levage associé au démonte-pneu. Il doit être doté de rouleaux pour faciliter la rotation de la roue lors du détalonnage du pneu.',
          'Installer un système de levage associé à l\'équilibreuse pour amener la roue au niveau de l\'axe de l\'équilibreuse.',
          'Utiliser un lève-roue mobile pour déplacer les roues entre les divers équipements et les mettre à niveau sans les porter manuellement.',
          'Rédiger une fiche de poste reprenant toutes les consignes d\'utilisation de l\'équilibreuse et du démonte-pneus.',
          'Former les salariés à l\'utilisation des aides à la manutention mises à leur disposition.'
        ],
        informationText: 'Le montage et le démontage des roues et des pneus présentent des risques de coupure, écrasement, pincement et sectionnement au niveau des mains.\nLa mise en rotation des roues lors de l\'équilibrage présente des risques de projection de gravier, masselotte, etc. La manutention des pneus est également source de contraintes physiques importantes.\nPour en savoir plus consultez la fiche : Limiter le recours aux manutentions manuelles lors des interventions sur les pneumatiques.'
      },
      {
        id: 'g4_6_1',
        displayNumber: '4.6.1',
        text: 'Les risques liés aux poussières de ponçage sont-ils pris en compte ?',
        measures: [
          'S\'équiper de ponceuses à aspiration intégrée, raccordées de préférence à une centrale d\'aspiration haute dépression avec filtration et rejet extérieur, ou à défaut à un aspirateur individuel.',
          'Privilégier l\'utilisation de disques micro perforés.',
          'Réaliser les opérations de ponçage dans des aires de préparation dédiées équipées de caillebotis aspirants.',
          'S\'équiper d\'une installation répondant aux règles de prévention du risque incendie-explosion, notamment en cas de ponçage de pièces ou carrosserie en aluminium.'
        ],
        informationText: 'Les poussières de ponçage sont nocives pour l\'appareil respiratoire, leur captation limite le risque d\'inhalation. Le ponçage de pièces en aluminium présente un risque d\'explosion.'
      },
      {
        id: 'g4_6_2',
        displayNumber: '4.6.2',
        text: 'Le masticage est-il effectué dans une zone ventilée ?',
        measures: [
          'Réaliser la préparation du masticage dans une zone ventilée (ex. dans le laboratoire de peinture).',
          'Appliquer et laisser sécher le mastic dans une zone ventilée (cabine horizontale, cabine verticale, caillebotis aspirant, etc.).',
          'Mettre à disposition des équipements de protection individuelle (masques, gants, combinaison, etc.) adaptés et stocker les masques à l\'abri des solvants et des poussières.'
        ],
        informationText: 'La préparation, la pose et le séchage du mastic exposent au risque chimique par contact et par inhalation, entraînant diverses pathologies : eczéma, asthme, etc.'
      },
      {
        id: 'g4_7_1',
        displayNumber: '4.7.1',
        text: 'Les travaux de soudage et de meulage sont-ils faits à l\'écart des produits inflammables (réservoirs d\'essence et GPL, batteries de traction des véhicules électriques ou hybrides, etc.) ?',
        measures: [
          'Pour tout travail par points chauds, respecter les préconisations du constructeur (éloigner le combustible de la source de chaleur, vidanger le réservoir, déposer la batterie, etc.).',
          'Utiliser des protections incombustibles pour isoler les zones à souder sur le véhicule.',
          'Isoler les travaux de soudage du reste de l\'atelier, par un rideau filtrant.',
          'Disposer des extincteurs à proximité des zones de soudage et former régulièrement les salariés à la manipulation des extincteurs.'
        ],
        informationText: 'Les travaux par points chauds (soudage, oxycoupage, meulage) peuvent être à l\'origine d\'incendies ou d\'explosions.'
      },
      {
        id: 'g4_7_2',
        displayNumber: '4.7.2',
        text: 'Le poste de soudage est-il muni d\'un dispositif d\'aspiration ?',
        measures: [
          'Mettre en place un dispositif de captage (torche aspirante pour le soudage mig, bras aspirant, etc.).',
          'Mettre à disposition et vérifier le port d\'équipements de protection individuelle (masque de soudage à ventilation assistée ou masque filtrant, gants, lunettes).'
        ],
        informationText: 'Les fumées et gaz émis lors des travaux de soudage sont toxiques et peuvent entraîner des pathologies respiratoires et des cancers.'
      },
      {
        id: 'g4_8_1',
        displayNumber: '4.8.1',
        text: 'La préparation des peintures est-elle effectuée dans un laboratoire ventilé ?',
        measures: [
          'Installer un laboratoire de préparation avec rejet extérieur et s\'assurer que les entrées d\'air du laboratoire sont toujours dégagées.',
          'Fermer immédiatement tous les contenants après utilisation afin de réduire la quantité de vapeurs rejetées dans l\'air et stocker les chiffons souillés dans des poubelles fermées.',
          'Mettre à disposition des équipements de protection individuelle (gants, lunettes, etc.) adaptés.'
        ],
        informationText: 'La peinture des véhicules et les opérations préalables exposent les opérateurs à l\'inhalation ou au contact cutané avec des produits toxiques qui peuvent provoquer des vertiges, une atteinte du système nerveux, des risques hépatiques et sanguins, des allergies cutanées et respiratoires, des cancers. Dans la phase de préparation des peintures, un système d\'aspiration permet de limiter l\'inhalation des produits. La vérification des systèmes d\'aspiration se fait annuellement et en référence au dossier d\'installation de ventilation.\nLes laboratoires de préparation doivent répondre à la norme NF T 35-014.'
      },
      {
        id: 'g4_8_2',
        displayNumber: '4.8.2',
        text: 'Votre cabine de peinture fait-elle l\'objet d\'une vérification et d\'une maintenance périodique ?',
        measures: [
          'Faire procéder à la vérification périodique de la cabine de peinture et remédier aux anomalies constatées.',
          'Remplacer les éléments filtrants de la cabine, sans attendre le colmatage des filtres (définir un planning de remplacement avec le fournisseur).',
          'Mettre à disposition des équipements de protection individuelle (masques, gants, combinaison, etc.) adaptés et stocker les masques à l\'abri des solvants et des poussières.'
        ],
        informationText: 'La peinture des véhicules et les opérations préalables exposent les opérateurs à l\'inhalation ou au contact cutané avec des produits toxiques qui peuvent provoquer des vertiges, une atteinte du système nerveux, des risques hépatiques et sanguins, des allergies cutanées et respiratoires, voire des cancers.\nLes opérations de peinture sont effectuées dans des cabines à ventilation verticale (ou des cabines à ventilation horizontale ou frontale pour les petits travaux). Se référer au guide pratique de ventilation 9.1 de l\'INRS (brochure ED 839). La vérification des systèmes d\'aspiration se fait annuellement et en référence au dossier d\'installation de ventilation.'
      },
      {
        id: 'g4_8_3',
        displayNumber: '4.8.3',
        text: 'L\'inhalation et le contact cutané avec les produits chimiques sont-ils évités lors des opérations de nettoyage de l\'outillage et du poste de travail ?',
        measures: [
          'Utiliser un poste de nettoyage automatique des pistolets avec rejet extérieur des polluants.',
          'Utiliser un poste de nettoyage automatique des pistolets avec rejet extérieur des polluants.',
          'Supprimer le nettoyage des godets en les remplaçant par des contenants souples sous vide.',
          'Mettre à disposition des équipements de protection individuelle (masques, gants nitriles, etc.) adaptés et stocker les masques à l\'abri des solvants et des poussières.'
        ],
        informationText: 'Les opérations de nettoyage sont fortement exposantes aux solvants et autres produits (éthers de glycol des peintures à l\'eau, isocyanates dans les durcisseurs de vernis par exemple). Ces produits sont nocifs pour la santé par inhalation ou contact avec la peau.'
      }
    ]
  },
  {
    id: 'depannage_remorquage',
    label: 'Dépannage - remorquage sur la voie publique',
    displayNumber: '5',
    defaultDescription: 'Les activités de dépannage et de remorquage de véhicules accidentés ou en panne sur la voie publique comportent de nombreux risques, en particulier celui d\'être heurté par un autre véhicule lors de l\'intervention.',
    questions: [
      {
        id: 'g5_gate',
        displayNumber: '5',
        text: 'Avez-vous une activité de dépannage - remorquage sur la voie publique ?',
        isYesNoOnly: true,
        measures: [],
        informationText: ''
      },
      {
        id: 'g5_1',
        displayNumber: '5.1',
        text: 'Des mesures sont-elles prises pour limiter les risques de collision par un autre véhicule lors de l\'intervention ?',
        measures: [
          'Fournir les équipements nécessaires au balisage de la zone d\'intervention.',
          'Fournir des vêtements haute-visibilité (classe 3 - propre et en bon état).',
          'Former les dépanneurs à intervenir en sécurité sur la voie publique : analyse préalable de la situation afin d\'identifier les risques liés à la circulation, port systématique de vêtements haute visibilité, mise en œuvre des gyrophares et autres dispositifs d\'éclairage fixes ou mobiles, etc.',
          'Formaliser un plan de prévention avec la concession autoroutière afin notamment de définir les conditions d\'intervention en sécurité en lien avec les autres intervenants (police, gendarmerie, ambulance...).'
        ],
        informationText: 'Lors d\'une intervention sur la voie publique, le risque de collision par un autre véhicule peut avoir des conséquences graves, voire fatales pour les dépanneurs.'
      },
      {
        id: 'g5_2',
        displayNumber: '5.2',
        text: 'Les risques de chutes sont-ils pris en compte ?',
        measures: [
          'Veillez au bon état des poignées ou mains courante permettant l\'accès aux véhicules de dépannage en respectant la règle des trois points d\'appuis.',
          'Rappeler la consigne de ne jamais sauter du plateau.',
          'Fournir et faire porter des chaussures de sécurité montantes et antidérapantes.',
          'Sensibiliser les dépanneurs au risque de chutes de plain-pied et de hauteur.'
        ],
        informationText: 'Une chaussée glissante (présence de carburant, d\'huiles, verglas, neige, pluie...), ou encombrée de débris expose les salariés à un risque de chute de plain-pied. Les chutes depuis la cabine du véhicule ou du plateau sont également fréquentes lors des activités de dépannage.'
      },
      {
        id: 'g5_3',
        displayNumber: '5.3',
        text: 'Les opérations de prise en charge du véhicule sont-elles réalisées en sécurité ?',
        measures: [
          'Veiller au bon fonctionnement des moyens de manutention mis à disposition (treuil, grue, chariot) et former les salariés à leur utilisation en sécurité.',
          'Contrôler régulièrement l\'état des câbles (intègres, non effilochés) et des chaînes de treuillage et inciter les salariés à faire remonter tout défaut constaté.',
          'Fournir des chandelles de différentes hauteurs, former les salariés à installation systématique des chandelles sous le châssis.',
          'Former les dépanneurs aux bonnes pratiques : respecter les règles de levage jusqu\'au point de basculement maximum, rester éloigné de la zone de treuillage, ne pas circuler sous une charge suspendue, etc.',
          'Fournir et faire porter des EPI adaptés (chaussures, gants antiheurt, casque de sécurité avec jugulaire).'
        ],
        informationText: 'La prise en charge des véhicules accidentés nécessite la mise en œuvre de moyens de manutention spécifiques (treuil, grue, chariot) auxquels les salariés doivent être formés.'
      },
      {
        id: 'g5_4',
        displayNumber: '5.4',
        text: 'Des mesures sont-elles mises en place en cas de fuites de liquides dangereux (liquide de refroidissement, acide des batteries, liquide de frein...) ?',
        measures: [
          'Former les salariés aux bonnes pratiques en cas de risque de fuites de liquides dangereux : contrôler l\'état des flexibles avant démontage, supprimer la pression dans les flexibles, mettre en sécurité les équipements branchés sur un circuit hydraulique, etc.',
          'Mettre à disposition un système de purge automatique, former les salariés à son utilisation.',
          'Mettre à disposition un kit cache-essieu pour la dépose des demi-arbres de roues et former les salariés à son utilisation systématique.',
          'Mise à disposition de bac étanche, et d\'un kit de nettoyage (absorbants, balai, pelle).',
          'Fournir et faire porter des EPI adaptés (gants nitrile, lunettes de sécurité). Sensibiliser les salariés à la prévention de risques chimiques.'
        ],
        informationText: 'Sur le lieu d\'un accident, les fuites de liquides dangereux sont fréquentes et doivent faire l\'objet de mesures de prévention adaptées.'
      },
      {
        id: 'g5_5',
        displayNumber: '5.5',
        text: 'Les opérations de dépannage sur les véhicules électriques sont-elles réalisées en sécurité ?',
        measures: [
          'Faire procéder à un contrôle visuel de l\'état de la batterie de traction et des éléments sous tension.',
          'Former les salariés aux interventions en sécurité sur ou à proximité de ces véhicules (B2XL « Dépannage-remorquage de véhicule électrique et hybride »).',
          'Fournir et faire porter les équipements de protection individuelle pour les opérations le nécessitant : gants isolants, écran facial, etc.',
          'En cas de fumées au niveau de la batterie de traction haute tension, demander une aide des pompiers avant toute intervention.'
        ],
        informationText: 'Les opérations de dépannage sur les véhicules électriques présentent des risques spécifiques qui nécessitent des mesures de prévention adaptées. Pour en savoir plus, consultez la brochure INRS ED 6313 : "L\'habilitation électrique. Opérations sur véhicules et engins".'
      }
    ]
  },
  {
    id: 'commerce_automobile',
    label: 'Commerce automobile',
    displayNumber: '6',
    defaultDescription: '',
    questions: [
      {
        id: 'g6_1',
        displayNumber: '6',
        text: 'Avez-vous une activité de commerce automobile (véhicules, pièces détachées...) ?',
        isYesNoOnly: true,
        measures: [],
        informationText: ''
      },
      {
        id: 'g6_1_sub',
        displayNumber: '6.1',
        text: 'Réception et parcage des véhicules',
        hasSubQuestions: true,
        subDescription: 'Le transfert des véhicules depuis le lieu de déchargement sur le lieu de parcage peut exposer le salarié à des risques de chutes de plain-pied et de hauteur et des risques de collision',
        measures: [],
        informationText: ''
      },
      {
        id: 'g6_1_1',
        displayNumber: '6.1.1',
        text: 'Pour accéder à la zone de déchargement et de parcage des véhicules, le salarié empreinte-t-il un chemin aménagé ?',
        measures: [
          { id: 'gm6_1_1_1', text: 'Privilégier les circuits courts en tenant compte de l\'activité réelle et en consultant les utilisateurs.' },
          { id: 'gm6_1_1_2', text: 'Aménager les chemins d\'accès en privilégiant des matériaux résistants aux intempéries et roulage éventuels des véhicules.' },
          { id: 'gm6_1_1_3', text: 'Limiter les dénivellations et différence de niveaux.' },
          { id: 'gm6_1_1_4', text: 'Mettre en place une organisation afin de prévenir les risques de glissades lors des épisodes hivernaux (neige, verglas, feuilles) ou lors d\'écoulement de fluides de véhicules (fuites).' },
          { id: 'gm6_1_1_5', text: 'Informer et sensibiliser le salarié sur le risque de chutes et les mesures permettant de les limiter.' }
        ],
        informationText: 'Se déplacer sur un sol en bon état, ne présentant pas de trous, de bosses, dégagé d\'obstacles, limitant les dénivelés et les différences de niveau limite le risque de chute. Un bon écoulement des eaux pluviales limite les détériorations du sol et les glissades.'
      },
      {
        id: 'g6_2',
        displayNumber: '6.2',
        text: 'Nettoyage et préparation des véhicules',
        hasSubQuestions: true,
        subDescription: 'La préparation des véhicules proposés à la vente peut exposer le salarié à de nombreux risques tels que les chutes dans les zones de déchargement et les parkings, les postures contraignantes et l\'utilisation de produits chimiques pour le nettoyage des véhicules.',
        measures: [],
        informationText: ''
      },
      {
        id: 'g6_2_1',
        displayNumber: '6.2.1',
        text: "Des mesures sont-elles mises en place pour prévenir les risques liés à l'usage de produits de nettoyage, d'entretien ou de rénovation ?",
        measures: [
          'Recenser les produits utilisés et vérifier leur prise en compte dans la démarche de prévention des risques chimiques (voir la rubrique "Risques communs à toutes les activités > Autres risques").',
          'Stocker tous les produits chimiques en respectant les règles de compatibilité (huiles, diluants, peintures…) dans un local fermé ou une armoire de stockage dotée d\'un système de rétention et si nécessaire une ventilation.',
          'Effectuer l\'intervention dans une zone ventilée (privilégier la ventilation mécanique à l\'intérieur des locaux).',
          'Si l\'opération nécessite une phase "moteur tournant", prévoir un captage localisé à la source des gaz d\'échappement avec rejet à l\'extérieur du bâtiment.',
          'Fournir les équipements de protections individuelles adaptés : gants, masques.'
        ],
        informationText: 'L\'utilisation de produits chimiques expose les salariés à des risques pour leur santé. Le contact répété avec certains agents chimiques, même à de faibles doses, peut porter atteinte aux poumons, aux nerfs, au cerveau, aux reins… Les produits de nettoyage par exemple moteur et jantes peuvent contenir des agents chimiques toxiques, corrosifs, ou allergisant. Plus particulièrement le nettoyage de l\'habitacle et/ou du circuit de ventilation/climatisation utilisant l\'ozone peut présenter un risque mortel.'
      },
      {
        id: 'g6_2_2',
        displayNumber: '6.2.2',
        text: 'Des mesures sont-elles prévues pour limiter le risque de chute ?',
        measures: [
          'Aménager un espace spécifique pour la préparation et le nettoyage des véhicules, à l\'écart des lieux de passage.',
          'Limiter les dénivellations et différence de niveaux.',
          'Mettre à disposition des matériels stables (type PIRL, Plateforme Individuelle Roulante Légère) permettant l\'intervention en hauteur.',
          'Éviter ou sécuriser tout passage de câbles électriques, réseaux, etc., au sol (en particulier dans les bureaux).',
          'Informer et sensibiliser le salarié sur le risque de chutes et les mesures permettant de les limiter.'
        ],
        informationText: 'Un sol encombré d\'éléments tel que des alimentations électriques, tuyaux d\'eau, d\'aspirateurs expose à un risque de chute de plain-pied. Une intervention sur un sol humide suite à une opération d\'entretien du sol ou de nettoyage du véhicule expose le salarié à un risque de glissade. Enfin, le salarié est exposé à un risque de chute lorsqu\'il utilise un marchepied, un escabeau pour accéder aux parties supérieures du véhicule.'
      },
      {
        id: 'g6_3',
        displayNumber: '6.3',
        text: 'Réception et stockage des pièces et matériels',
        hasSubQuestions: true,
        subDescription: 'Les phases de réception et de stockage des marchandises impliquent des déplacements et manutentions. Une bonne organisation doit permettre de limiter les risques associés à ces tâches. L\'encombrement au sol comme les zones d\'ombre favorise le risque de chute.',
        measures: [],
        informationText: ''
      },
      {
        id: 'g6_3_1',
        displayNumber: '6.3.1',
        text: 'Le point de livraison est-il matérialisé et fonctionnel ?',
        measures: [
          'Aménager et matérialiser une zone de livraison.',
          'Mettre à disposition des équipements facilitant la dépose et le transfert des colis (desserte pour colis, rack sur roulette pour porte, pare-brise et pneus).',
          'Indiquer aux fournisseurs le point de livraison et le support à utiliser en fonction du type de colis.'
        ],
        informationText: 'Un point de livraison correctement matérialisé et aménagé limite les déposes au sol en vrac, évite l\'encombrement des allées et postes de travail et réduit le risque de chute. En outre, la dépose sur une desserte facilite les manutentions en particulier des colis lourds et volumineux.'
      },
      {
        id: 'g6_3_2',
        displayNumber: '6.3.2',
        text: 'Les escaliers, couloirs et lieux de stockage sont-ils sécurisés et correctement éclairés ?',
        measures: [
          'Sécuriser les escaliers en les équipant de rampes et de revêtement antidérapant.',
          'Installer un monte-charge pour éviter les manutentions dans les escaliers.',
          'Équiper la mezzanine de garde-corps périphériques et d\'une barrière-écluse permettant de sécuriser les zones de transfert des marchandises entre deux niveaux.',
          'Assurer un éclairage suffisant (disposé de façon à limiter les zones d\'ombres) dans l\'ensemble des locaux et en fonction des tâches à réaliser.',
          'Privilégier des éclairages à longue durée de vie.'
        ],
        informationText: 'Installer et maintenir un éclairage de qualité permet d\'assurer une circulation et des manutentions dans de bonnes conditions (que les zones soient accessibles ou non aux clients) en particulier dans les escaliers où les chutes peuvent causer des accidents très graves (même une seule marche).'
      },
      {
        id: 'g6_4',
        displayNumber: '6.4',
        text: 'Mise en rayon',
        hasSubQuestions: true,
        subDescription: 'Les phases de mise en rayon peuvent présenter différents risques liés aux tâches de déballage comme les coupures, aux manutentions et aux postures de travail, par exemple les postures lors des accès en hauteur.',
        measures: [],
        informationText: ''
      },
      {
        id: 'g6_4_1',
        displayNumber: '6.4.1',
        text: 'Le risque de coupure lors du déballage a-t-il été pris en compte ?',
        measures: [
          'Prévoir un espace spécifique pour le déballage des colis.',
          'Utiliser des outils avec lame protégée.'
        ],
        informationText: 'Les phases de déballage de colis pour la mise en rayon des marchandises peuvent donner lieu à des blessures avec des outils coupants.'
      },
      {
        id: 'g6_4_2',
        displayNumber: '6.4.2',
        text: 'Le transfert des produits et la mise en rayon se font-ils facilement (sans accès en hauteur et sans posture contraignante) ?',
        measures: [
          'Utiliser du matériel de manutention adapté (table élévatrice, desserte, chariot à fond constant, transpalette à haute levée, diable serre-pneus).',
          'Mettre à disposition des moyens d\'accès en hauteur sécurisés (Plateforme Individuelle Roulante Légère).',
          'Aménager les rayonnages pour qu\'ils soient accessibles en limitant les postures inconfortables.',
          'Effectuer la mise en rayon en tenant compte de la fréquence d\'utilisation et des contraintes physiques associées aux manutentions manuelles (ex. : stockage des pièces lourdes à hauteur de préhension).',
          'Utiliser des rayonnages sécurisés (lisse et protection antichute sur plateforme, sabot protection des pieds des rayons).',
          'Mettre en place une ventilation générale mécanisée afin de rejeter à l\'extérieur du bâtiment les vapeurs nocives en particulier pour le stockage des pneumatiques.'
        ],
        informationText: 'Les opérations de transfert, de dépotage et de mise en rayon peuvent présenter des risques de heurts, de chute d\'objet, de chutes de hauteur, mais également des risques de pathologies du dos ou des membres supérieurs. De plus certains produits, comme les pneumatiques, peuvent émettre des vapeurs dangereuses pour la santé (Nitrosamines, Hydrocarbures Aromatiques Polycycliques).'
      },
      {
        id: 'g6_5',
        displayNumber: '6.5',
        text: 'Activité de vente et de gestion commerciale',
        hasSubQuestions: true,
        subDescription: 'Une grande partie du travail de suivi des dossiers, reporting d\'activité, ou veille sur le secteur s\'effectue sur écran. Le travail sur écran peut générer de la fatigue, des troubles musculosquelettiques, et des risques psychosociaux. Fournir un matériel adapté et former les salariés leur permet de réduire ces risques.',
        measures: [],
        informationText: ''
      },
      {
        id: 'g6_5_1',
        displayNumber: '6.5.1',
        text: 'Les équipements et le mobilier sont-ils confortables et ajustables ?',
        measures: [
          'Fournir un mobilier (siège, table...) adaptable à chacun et réglable permettant une posture adaptée (cuisses horizontales et pieds à plat sur le sol, dos appuyé sur le dossier du siège).',
          'Équiper le point de vente de sièges permettant la position assis-debout.',
          'Former le salarié aux réglages du poste de travail.',
          'Positionner les équipements informatiques (écrans, imprimantes) de façon à éviter les postures inconfortables (ex. : positionner le haut du moniteur au niveau des yeux).',
          'Privilégier l\'éclairage naturel, et en complément, prévoir un éclairage assurant un éclairement homogène des plans de travail.',
          'Placer les écrans d\'ordinateur perpendiculairement aux fenêtres pour éviter les reflets et les éblouissements.'
        ],
        informationText: 'Le mobilier doit être choisi en fonction des caractéristiques physiques de l\'utilisateur et de la tâche. Il doit offrir des réglages qui répondent à la diversité des utilisateurs et à l\'évolution des contextes d\'utilisation au cours du temps.'
      },
      {
        id: 'g6_5_2',
        displayNumber: '6.5.2',
        text: "L'organisation du travail sur écran et les logiciels utilisés sont-ils adaptés à la tâche et au niveau de connaissance des utilisateurs ?",
        measures: [
          'Adapter la formation pour l\'utilisation des logiciels selon le niveau de connaissance et d\'expérience de l\'utilisateur.',
          'En cas de nouveau logiciel, mettre en place un programme de formation adapté.',
          'Prévoir un accompagnement dans les premiers temps d\'utilisation du logiciel et en cas de difficultés d\'utilisation ultérieures.',
          'Favoriser, dans la mesure du possible, une autonomie organisationnelle des salariés (flexibilité des pauses, alternance de tâches de nature différente, répartition de la charge de travail, etc.).'
        ],
        informationText: 'Les logiciels utilisés doivent être adaptés à la tâche à exécuter et d\'un usage facile et adapté au niveau de connaissance et d\'expérience de l\'utilisateur.'
      },
      {
        id: 'g6_5_3',
        displayNumber: '6.5.3',
        text: 'Les relations avec les clients sont-elles toujours courtoises et respectueuses ?',
        measures: [
          'Rendre l\'offre commerciale la plus compréhensible possible pour les clients.',
          'Suivre et gérer les incidents afin d\'identifier et traiter les causes récurrentes.',
          'Organiser la possibilité de faire appel à la hiérarchie en cas de difficulté avec un client.',
          'Définir des consignes pour la gestion des litiges avec les clients.'
        ],
        informationText: 'Les violences externes, qu\'elles soient verbales ou physiques, font partie des risques psychosociaux et doivent être évaluées et prévenues au même titre que les autres risques.'
      },
      {
        id: 'g6_5_4',
        displayNumber: '6.5.4',
        text: 'Des dispositions ont-elles été prises pour prévenir les risques de vols et de braquage ?',
        measures: [
          'Former le personnel à la conduite à tenir en cas de vol.',
          'Installer un système antivol.',
          'Installer un système de vidéo-surveillance.',
          'Aménager le point de vente de manière à supprimer les angles morts ou zones cachées.',
          'Aménager le point de vente pour permettre aux salariés de se soustraire à une agression.',
          'Organiser les phases d\'ouverture et de fermeture du point de vente pour les rendre les plus sûres possible (pas de salarié seul).',
          'Équiper le point de vente d\'une caisse sécurisée (sans manipulation d\'argent liquide).'
        ],
        informationText: 'Tout commerce est susceptible de faire l\'objet de tentatives de vols et de braquages. Ces situations violentes et traumatisantes doivent être anticipées, notamment par des mesures organisationnelles et d\'aménagement du point de vente, pour en limiter la probabilité et les conséquences.'
      }
    ]
  },
  {
    id: 'risques_personnalises',
    label: 'Risques personnalisés',
    displayNumber: '7',
    defaultDescription: 'Si vous avez identifié des risques qui ne sont pas abordés par l\'outil, vous pouvez les ajouter ici.\n\nImportant: Afin d\'éviter les doublons, nous vous recommandons au préalable de bien parcourir l\'ensemble des modules si ce n\'est déjà fait.\n\nSi vous ne devez pas ajouter de risques, veuillez continuer.',
    questions: []
  }
];
