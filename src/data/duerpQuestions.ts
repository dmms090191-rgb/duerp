export interface DuerpMeasure {
  id: string;
  text: string;
  standardMeasures?: string[];
}

export interface DuerpQuestion {
  id: string;
  text: string;
  measures: DuerpMeasure[];
  informationText?: string;
  isYesNoOnly?: boolean;
  yesNoQuestion?: string;
  displayNumber?: string;
}

export interface DuerpCategory {
  id: string;
  label: string;
  displayNumber?: string;
  defaultDescription?: string;
  questions: DuerpQuestion[];
  parentGateQuestionId?: string;
}

export const duerpCategories: DuerpCategory[] = [
  {
    id: 'amenagement_locaux',
    label: 'Aménagement des locaux',
    defaultDescription: 'Les locaux aménagés en tenant compte des besoins et des contraintes des salariés permettent de réduire les risques.\n\nCette partie traite de l\'aménagement des locaux, par exemple des zones de circulation, de l\'état des sols mais également de la maîtrise du niveau sonore, des systèmes de captage des polluants à la source, de la ventilation générale ou de l\'éclairage.',
    questions: [
      {
        id: 'q1_1',
        text: 'Un plan de circulation interne a-t-il été établi pour les locaux ?',
        measures: [
          {
            id: 'm1_1_1',
            text: 'Identifier les flux de personnes, les flux des engins mobiles et les flux de véhicules afin d\'établir un plan de circulation dans l\'entreprise.',
            standardMeasures: [
              'Identifier les flux de personnes, les flux des engins mobiles et les flux de véhicules afin d\'établir un plan de circulation dans l\'entreprise.',
              'Aménager des allées réservées pour les différents usages (piétons, chariot…) et de largeur suffisante.',
              'Interdire si possible les croisements et intersections des différents flux.',
              'En cas d\'impossibilité d\'interdiction des croisements des flux, matérialiser les voies de circulations et les voies piétonnes.',
              'Protéger les voies piétonnes si possible par des barrières.',
              'Choisir avec soin le revêtement de sol selon l\'usage des zones de circulation (piétons, engins).'
            ]
          },
          {
            id: 'm1_1_2',
            text: 'Aménager des allées réservées pour les différents usages (piétons, chariot…) et de largeur suffisante.',
            standardMeasures: [
              'Identifier les flux de personnes, les flux des engins mobiles et les flux de véhicules afin d\'établir un plan de circulation dans l\'entreprise.',
              'Aménager des allées réservées pour les différents usages (piétons, chariot…) et de largeur suffisante.',
              'Interdire si possible les croisements et intersections des différents flux.',
              'En cas d\'impossibilité d\'interdiction des croisements des flux, matérialiser les voies de circulations et les voies piétonnes.',
              'Protéger les voies piétonnes si possible par des barrières.',
              'Choisir avec soin le revêtement de sol selon l\'usage des zones de circulation (piétons, engins).'
            ]
          },
          {
            id: 'm1_1_3',
            text: 'Interdire si possible les croisements et intersections des différents flux.',
            standardMeasures: [
              'Identifier les flux de personnes, les flux des engins mobiles et les flux de véhicules afin d\'établir un plan de circulation dans l\'entreprise.',
              'Aménager des allées réservées pour les différents usages (piétons, chariot…) et de largeur suffisante.',
              'Interdire si possible les croisements et intersections des différents flux.',
              'En cas d\'impossibilité d\'interdiction des croisements des flux, matérialiser les voies de circulations et les voies piétonnes.',
              'Protéger les voies piétonnes si possible par des barrières.',
              'Choisir avec soin le revêtement de sol selon l\'usage des zones de circulation (piétons, engins).'
            ]
          },
          {
            id: 'm1_1_4',
            text: 'En cas d\'impossibilité d\'interdiction des croisements des flux, matérialiser les voies de circulations et les voies piétonnes.',
            standardMeasures: [
              'Identifier les flux de personnes, les flux des engins mobiles et les flux de véhicules afin d\'établir un plan de circulation dans l\'entreprise.',
              'Aménager des allées réservées pour les différents usages (piétons, chariot…) et de largeur suffisante.',
              'Interdire si possible les croisements et intersections des différents flux.',
              'En cas d\'impossibilité d\'interdiction des croisements des flux, matérialiser les voies de circulations et les voies piétonnes.',
              'Protéger les voies piétonnes si possible par des barrières.',
              'Choisir avec soin le revêtement de sol selon l\'usage des zones de circulation (piétons, engins).'
            ]
          },
          {
            id: 'm1_1_5',
            text: 'Protéger les voies piétonnes si possible par des barrières.',
            standardMeasures: [
              'Identifier les flux de personnes, les flux des engins mobiles et les flux de véhicules afin d\'établir un plan de circulation dans l\'entreprise.',
              'Aménager des allées réservées pour les différents usages (piétons, chariot…) et de largeur suffisante.',
              'Interdire si possible les croisements et intersections des différents flux.',
              'En cas d\'impossibilité d\'interdiction des croisements des flux, matérialiser les voies de circulations et les voies piétonnes.',
              'Protéger les voies piétonnes si possible par des barrières.',
              'Choisir avec soin le revêtement de sol selon l\'usage des zones de circulation (piétons, engins).'
            ]
          },
          {
            id: 'm1_1_6',
            text: 'Choisir avec soin le revêtement de sol selon l\'usage des zones de circulation (piétons, engins).',
            standardMeasures: [
              'Identifier les flux de personnes, les flux des engins mobiles et les flux de véhicules afin d\'établir un plan de circulation dans l\'entreprise.',
              'Aménager des allées réservées pour les différents usages (piétons, chariot…) et de largeur suffisante.',
              'Interdire si possible les croisements et intersections des différents flux.',
              'En cas d\'impossibilité d\'interdiction des croisements des flux, matérialiser les voies de circulations et les voies piétonnes.',
              'Protéger les voies piétonnes si possible par des barrières.',
              'Choisir avec soin le revêtement de sol selon l\'usage des zones de circulation (piétons, engins).'
            ]
          }
        ],
        informationText: 'La circulation des chariots de manutention manuels ou mécaniques génère des risques de collisions avec les piétons.'
      },
      {
        id: 'q1_2',
        text: 'Le risque de chute de plain-pied est-il pris en compte ?',
        measures: [
          {
            id: 'm1_2_1',
            text: 'Supprimer, réduire ou signaler tout obstacle, petit dénivelé, aspérité dans les aires de circulation.'
          },
          {
            id: 'm1_2_2',
            text: 'Éclairer correctement les allées de circulation.'
          },
          {
            id: 'm1_2_3',
            text: 'Réparer les sols endommagés et supprimer au maximum les dénivelés.'
          },
          {
            id: 'm1_2_4',
            text: 'Organiser le travail de façon à limiter les déplacements inutiles.'
          },
          {
            id: 'm1_2_5',
            text: 'Prévoir le nettoyage régulier des sols.'
          },
          {
            id: 'm1_2_6',
            text: 'Fournir et faire porter des chaussures de sécurité antidérapantes.'
          }
        ],
        informationText: 'Les facteurs susceptibles de provoquer une chute peuvent paraître bénins (sol sale, encombré, humide, déplacement rapide, transport d\'objet, éclairage insuffisant, attention focalisée sur une autre tâche que le déplacement...) mais génèrent pourtant de nombreux accidents. La survenue de l\'accident résulte le plus souvent de la combinaison de plusieurs facteurs.'
      },
      {
        id: 'q1_3',
        text: 'Des mesures techniques et organisationnelles ont-elles été prises pour maîtriser le niveau sonore ?',
        measures: [
          {
            id: 'm1_3_1',
            text: 'À l\'achat des machines, à qualité égale, choisir celle ayant la puissance acoustique la plus faible.'
          },
          {
            id: 'm1_3_2',
            text: 'Privilégier l\'usage de matériels ou de techniques les moins bruyants.'
          },
          {
            id: 'm1_3_3',
            text: 'Traiter les locaux devant recevoir des machines bruyantes par un revêtement acoustique adapté à l\'activité.'
          },
          {
            id: 'm1_3_4',
            text: 'Réaliser un local technique traité acoustiquement pour encoffrer les machines bruyantes comme le compresseur à air, etc.'
          },
          {
            id: 'm1_3_5',
            text: 'Séparer par des écrans acoustiques les machines qui ne peuvent être encoffrées.'
          },
          {
            id: 'm1_3_6',
            text: 'Identifier et traiter les fuites d\'air comprimé éventuelles émissives de bruit.'
          },
          {
            id: 'm1_3_7',
            text: 'Faire réaliser, si nécessaire, le mesurage des niveaux de bruit qui subsistent par des personnes compétentes et mettre en place des mesures de protection des travailleurs exposés.'
          },
          {
            id: 'm1_3_8',
            text: 'Signaler les lieux de travail où le niveau de bruit est important (pictogramme risque bruit et port obligatoire des protecteurs individuels contre le bruit).'
          },
          {
            id: 'm1_3_9',
            text: 'Informer et former les salariés aux risques liés au bruit.'
          },
          {
            id: 'm1_3_10',
            text: 'Fournir et faire porter les équipements de protection individuelle correspondants (casques anti-bruit, bouchons d\'oreilles…) lorsque le niveau de bruit ne peut pas être réduit par la mise en place de protections collectives.'
          },
          {
            id: 'm1_3_11',
            text: 'Se reporter à la fiche entreprise établie par le médecin du travail et organiser le suivi individuel de l\'état de santé des salariés concernés.'
          }
        ],
        informationText: 'Le bruit constitue une nuisance majeure dans les ateliers de revêtement et de traitement des métaux. Il est lié à l\'usage de machines bruyantes, mais également à celui de soufflettes à air comprimé notamment dans des corps creux, utilisées dans des locaux sans traitement acoustique. Il peut provoquer du stress et de la fatigue qui, à long terme, ont des conséquences sur la santé et la qualité de travail mais également des surdités.\n\nDu traitement acoustique des locaux à l\'encoffrement des machines bruyantes, les mesures collectives de lutte contre le bruit sont les plus efficaces. Pour en savoir plus, consulter la brochure INRS "ED 6020 - Moins fort le bruit".'
      },
      {
        id: 'q1_4',
        text: 'L\'éclairage est-il adapté aux différents travaux réalisés ?',
        measures: [
          {
            id: 'm1_4_1',
            text: 'Aménager les locaux pour que les ateliers disposent d\'éclairage naturel (sauf si incompatible avec la tâche) afin d\'éviter de travailler en lumière artificielle de façon permanente.'
          },
          {
            id: 'm1_4_2',
            text: 'Identifier et adapter le type d\'éclairage et le niveau d\'éclairement en fonction des activités et des opérations à réaliser.'
          },
          {
            id: 'm1_4_3',
            text: 'Prévoir la possibilité d\'occulter les baies vitrées (pare-soleil en extérieur, côté sud ; voile ou pare-soleil en intérieur).'
          },
          {
            id: 'm1_4_4',
            text: 'Vérifier ou faire vérifier par une personne compétente le niveau d\'éclairement aux différents postes de travail.'
          },
          {
            id: 'm1_4_5',
            text: 'Pour les polisseurs, qui ont une contrainte visuelle importante, prévoir un éclairage suffisant non éblouissant afin de permettre une bonne qualité de travail.'
          },
          {
            id: 'm1_4_6',
            text: 'Nettoyer les grilles et les éléments de réflexion des luminaires périodiquement.'
          }
        ],
        informationText: 'Un éclairage inadapté peut entraîner une fatigue visuelle, des maux de tête, une diminution de la vigilance et augmenter les risques d\'accidents. Dans les ateliers de traitement des métaux, un bon éclairage est essentiel pour détecter les défauts de surface et réaliser des travaux de précision en toute sécurité.'
      },
      {
        id: 'q1_5',
        text: 'Le mode de chauffage des locaux est-il adapté à l\'activité ?',
        measures: [
          {
            id: 'm1_5_1',
            text: 'Favoriser un mode de chauffage ou de climatisation ne générant pas de courant d\'air afin de ne pas perturber les dispositifs de captage à la source.'
          },
          {
            id: 'm1_5_2',
            text: 'Introduire l\'air neuf de compensation (refroidi ou réchauffé) par des gaines textiles diffusantes à basse vitesse par exemple.'
          }
        ],
        informationText: 'Les ambiances thermiques extrêmes (froid ou chaleur) peuvent affecter la santé et la sécurité des salariés. Le froid peut provoquer des engourdissements, une perte de dextérité et augmenter les risques d\'accidents. Dans les ateliers où des produits chimiques sont utilisés, certains modes de chauffage peuvent également générer des réactions dangereuses ou aggraver les risques d\'incendie.'
      }
    ]
  },
  {
    id: 'manutention_stockage',
    label: 'Manutention et stockage',
    defaultDescription: 'Les opérations de livraison, manutention et stockage comportent de nombreux risques (chutes, collisions, lombalgie, TMS, blessures, etc.) qu\'il est nécessaire de prendre en compte afin de mettre en place les mesures adaptées.',
    questions: [
      {
        id: 'q2_1',
        text: 'Les moyens de manutention mécanique et de levage sont-ils adaptés aux tâches ?',
        measures: [
          {
            id: 'm2_1_1',
            text: 'Privilégier les chargements / déchargements sur des quais adaptés au véhicule et munis d\'un dispositif niveleur de quai (mécanique / hydraulique ou électrique).'
          },
          {
            id: 'm2_1_2',
            text: 'Mettre à disposition des chariots automoteurs, ponts roulants, et tout autre moyen de levage.'
          },
          {
            id: 'm2_1_3',
            text: 'Former les salariés à l\'utilisation de ces moyens de manutention et délivrer une autorisation de conduite (vérifier l\'aptitude médicale, contrôler les connaissances et le savoir-faire, notamment par le CACES, informer sur les instructions à respecter).'
          },
          {
            id: 'm2_1_4',
            text: 'S\'assurer de l\'absence de trous et du bon état des voies de circulation des engins afin de réduire les vibrations transmises à l\'ensemble du corps.'
          },
          {
            id: 'm2_1_5',
            text: 'Veiller à ce que les opérateurs puissent régler leur siège afin de leur assurer une position stable. Faire participer les opérateurs au choix des sièges.'
          },
          {
            id: 'm2_1_6',
            text: 'Organiser les vérifications périodiques et maintenir en conformité les engins mobiles.'
          },
          {
            id: 'm2_1_7',
            text: 'Tenir à jour le carnet de maintenance.'
          }
        ],
        informationText: 'Les opérations de manutention et de levage représentent une part importante des risques d\'accidents du travail. L\'utilisation de moyens mécaniques adaptés (chariots, transpalettes, ponts roulants, palans) permet de réduire considérablement les efforts physiques et les risques de troubles musculo-squelettiques. Ces équipements doivent être adaptés aux charges à manipuler et entretenus régulièrement pour garantir la sécurité des opérateurs.'
      },
      {
        id: 'q2_2',
        text: 'Les zones de stockage sont-elles adaptées à l\'activité et correctement aménagées ?',
        measures: [
          {
            id: 'm2_2_1',
            text: 'Implanter et agencer l\'espace de stockage de façon à avoir un accès facilité.'
          },
          {
            id: 'm2_2_2',
            text: 'Privilégier le stockage en palettier et limiter la hauteur de gerbage de palettes de granulés (en sac ou big-bag) les unes sur les autres.'
          },
          {
            id: 'm2_2_3',
            text: 'Installer et entretenir les râteliers et palettiers de stockage en fonction des charges amenées à y être entreposées. Suivre les recommandations du fabricant lorsqu\'elles sont disponibles.'
          },
          {
            id: 'm2_2_4',
            text: 'Protéger les pieds des palettiers en fonction des charges amenées à y être déposées.'
          },
          {
            id: 'm2_2_5',
            text: 'Réaliser un suivi de l\'état des racks et réaliser immédiatement les réparations nécessaires.'
          },
          {
            id: 'm2_2_6',
            text: 'Installer des dispositifs, empêchant la chute des palettes ou d\'objets stockés (plancher, filet, grillage, arrêtoirs…).'
          },
          {
            id: 'm2_2_7',
            text: 'Interdire l\'encombrement des voies d\'accès, des issues et équipements de secours.'
          },
          {
            id: 'm2_2_8',
            text: 'Vérifier régulièrement les éléments afférents au stockage (ex. sabots, poids sur les lisses, déport en hauteur…).'
          },
          {
            id: 'm2_2_9',
            text: 'Organiser une sensibilisation sur le thème du rangement.'
          }
        ],
        informationText: 'Les espaces de stockage sont des lieux de flux constant qui peuvent concentrer toutes les matières premières et les produits finis. L\'organisation du rangement et de l\'espace facilite et sécurise le travail. Pour limiter le risque de chute d\'éléments stockés en hauteur, il convient d\'utiliser des palettiers adaptés.'
      }
    ]
  },
  {
    id: 'poste_travail',
    label: 'Au poste de travail',
    defaultDescription: 'Les salariés ont la connaissance du travail réel, leur participation active est la clé principale de la réussite de la démarche.\n\nL\'observation des postes de travail et surtout le dialogue avec les opérateurs sont donc indispensables.',
    questions: [
      {
        id: 'q3_1',
        text: 'Des mesures sont-elles prises pour limiter les postures inconfortables et les gestes répétitifs ?',
        measures: [
          {
            id: 'm3_1_1',
            text: 'Identifier et aménager les postes de travail concernés pour limiter les postures statiques prolongées et contraignantes (flexion, inclinaison, rotation du tronc).'
          },
          {
            id: 'm3_1_2',
            text: 'Automatiser les tâches engendrant des postures contraignantes (machines de montage…).'
          },
          {
            id: 'm3_1_3',
            text: 'Organiser une rotation des tâches et favoriser la polyvalence des salariés.'
          },
          {
            id: 'm3_1_4',
            text: 'Mettre en place des tables à hauteur variable afin d\'adapter la hauteur de travail à la morphologie de chaque salarié.'
          },
          {
            id: 'm3_1_5',
            text: 'Intégrer la prévention des contraintes liées aux postures lors de la mise en place de nouveaux agencement ou de nouvelles activités.'
          }
        ],
        informationText: 'Les troubles musculo-squelettiques (TMS) représentent la première cause de maladie professionnelle en France. Dans les activités de traitement des métaux, les postures contraignantes (travail bras en l\'air, dos courbé), les gestes répétitifs et le port de charges lourdes sollicitent fortement les articulations et les muscles. Un poste de travail ergonomique prévient ces troubles et améliore le confort et l\'efficacité des opérateurs.'
      },
      {
        id: 'q3_2',
        text: 'Les accès et travaux en hauteur sur les équipements de travail sont-ils sécurisés?',
        measures: [
          {
            id: 'm3_2_1',
            text: 'Privilégier les protections collectives (garde-corps, plateformes avec garde-corps).'
          },
          {
            id: 'm3_2_2',
            text: 'Utiliser des échafaudages ou des plateformes élévatrices mobiles de personnel (PEMP) pour les travaux en hauteur.'
          },
          {
            id: 'm3_2_3',
            text: 'Fournir des échelles conformes et en bon état uniquement pour des accès ponctuels.'
          },
          {
            id: 'm3_2_4',
            text: 'Former les salariés aux travaux en hauteur et à l\'utilisation des équipements de protection.'
          },
          {
            id: 'm3_2_5',
            text: 'Mettre en place des harnais antichute avec points d\'ancrage certifiés lorsque les protections collectives ne sont pas possibles.'
          },
          {
            id: 'm3_2_6',
            text: 'Vérifier régulièrement l\'état des équipements de protection contre les chutes.'
          }
        ],
        informationText: 'Les chutes de hauteur sont la deuxième cause d\'accidents mortels au travail. Dans les ateliers de traitement des métaux, les interventions sur les cuves, les systèmes de ventilation ou les équipements en hauteur exposent les salariés à ce risque. Les protections collectives (garde-corps, plateformes) doivent toujours être privilégiées. Les équipements de protection individuelle (harnais) ne sont utilisés qu\'en dernier recours.'
      },
      {
        id: 'q3_3',
        text: 'Les activités de maintenance des équipements et des installations sont-elles réalisées en sécurité ?',
        measures: [
          {
            id: 'm3_3_1',
            text: 'Intégrer dès la conception des équipements de protection contre les chutes, notamment pour les opérations de maintenance (ex. mise en place de barrière écluse sur les mezzanines, espace permettant l\'accès en sécurité aux équipements, etc.).'
          },
          {
            id: 'm3_3_2',
            text: 'Mettre en place des protections collectives, des passerelle et escaliers avec garde-corps d\'accès aux équipements de travail.'
          },
          {
            id: 'm3_3_3',
            text: 'Mettre à disposition des salariés des moyens tels que plate-forme individuelle roulante légère (PIRL), nacelles ou matériel intégrant des dispositifs évitant le risque de chute.'
          },
          {
            id: 'm3_3_4',
            text: 'Former les salariés à l\'utilisation de ces équipements.'
          }
        ],
        informationText: 'Les opérations de maintenance représentent des situations à risque élevé car elles sortent du cadre de la production normale. Les interventions sur des équipements sous tension, sous pression ou contenant des produits dangereux peuvent entraîner des accidents graves (électrocution, brûlures, intoxications). La consignation des énergies et la formation des intervenants sont essentielles pour garantir leur sécurité.'
      },
      {
        id: 'q3_4',
        text: 'Avez-vous tenu compte des contraintes du port des équipements de protection individuelle (EPI) lors de leur choix ?',
        measures: [
          {
            id: 'm3_4_1',
            text: 'Choisir un EPI (chaussant, tablier, blouse, casque, lunettes, masques, etc.) adapté à la nature du risque, aux caractéristiques du salarié (morphologie) et aux conditions de travail (durée, température, etc.) en associant les utilisateurs à leur choix.'
          },
          {
            id: 'm3_4_2',
            text: 'Former les opérateurs à leur utilisation et tester l\'efficacité des EPI au poste de travail.'
          },
          {
            id: 'm3_4_3',
            text: 'S\'assurer de choisir des gants capables de résister aux produits manipulés (ex. pour l\'utilisation de produits chimiques), ou à l\'activité (gants anti-coupures ou résistants à la chaleur).'
          }
        ],
        informationText: 'Les équipements de protection individuelle (EPI) ne doivent être utilisés qu\'en complément des protections collectives. Leur port prolongé peut générer de la gêne, de l\'inconfort, voire des risques supplémentaires s\'ils sont mal adaptés. Un EPI inconfortable sera moins porté, réduisant ainsi son efficacité. Le choix des EPI doit être fait en concertation avec les utilisateurs et tenir compte des contraintes réelles du travail.'
      }
    ]
  },
  {
    id: 'produits_chimiques',
    label: 'Utilisation et stockage des produits chimiques',
    defaultDescription: 'L\'utilisation de produits chimiques peut présenter des risques pour la santé et la sécurité des travailleurs.\n\nCette partie traite de l\'identification des produits chimiques utilisés (fiches de données de sécurité), de leur stockage (compatibilité, ventilation), des mesures de prévention lors de leur utilisation (captage à la source, protection individuelle) et de la gestion des déchets chimiques.',
    questions: [
      {
        id: 'q4_1',
        text: 'La prévention des risques liés à l\'utilisation des produits chimiques est-elle organisée ?',
        measures: [
          {
            id: 'm4_1_1',
            text: 'Réaliser l\'inventaire des produits chimiques.'
          },
          {
            id: 'm4_1_2',
            text: 'Disposer des fiches de données de sécurité (FDS).'
          },
          {
            id: 'm4_1_3',
            text: 'Évaluer le risque chimique (à l\'aide notamment de l\'outil en ligne Seirich).'
          },
          {
            id: 'm4_1_4',
            text: 'Substituer les produits les plus dangereux par des produits qui le sont moins, en lien avec vos fournisseurs ou donneurs d\'ordre (ex. pour les activités d\'épargne, utiliser des produits de masquage sans plomb).'
          },
          {
            id: 'm4_1_5',
            text: 'Supprimer chaque fois que possible les produits CMR (cancérogène, mutagène et reprotoxique).'
          },
          {
            id: 'm4_1_6',
            text: 'Établir un mode opératoire précis pour la manipulation des produits chimiques et rédiger les fiches ou notices de poste.'
          },
          {
            id: 'm4_1_7',
            text: 'Former et informer les salariés (notamment par la notice de poste).'
          },
          {
            id: 'm4_1_8',
            text: 'Fournir et veiller au port des équipements de protection individuelle mentionnés dans les FDS.'
          }
        ],
        informationText: 'La prévention des risques chimiques commence par une évaluation rigoureuse de tous les produits utilisés. Les Fiches de Données de Sécurité (FDS) fournissent les informations essentielles sur les dangers et les mesures de prévention. La substitution des produits les plus dangereux est la mesure de prévention la plus efficace. L\'exposition à certains produits chimiques peut provoquer des intoxications aiguës, des maladies professionnelles graves (cancers, atteintes respiratoires, dermatoses) et nécessite un suivi médical adapté.'
      },
      {
        id: 'q4_2',
        text: 'Existe-t-il des règles claires liées au stockage des produits chimiques dangereux ?',
        measures: [
          {
            id: 'm4_2_1',
            text: 'Stocker les produits dans un local spécifique, fermant de préférence à clé, muni d\'une ventilation adaptée.'
          },
          {
            id: 'm4_2_2',
            text: 'Conserver les produits dans leurs emballages munis de leur étiquetage d\'origine.'
          },
          {
            id: 'm4_2_3',
            text: 'En cas de transfert ou de transvasement, identifier les récipients secondaires en reproduisant l\'étiquette du récipient primaire.'
          },
          {
            id: 'm4_2_4',
            text: 'Réaliser et afficher le plan de stockage comportant la localisation des différentes classes de produits.'
          },
          {
            id: 'm4_2_5',
            text: 'Mettre en place des bacs de rétention par famille de produits. Gérer les déchets induits.'
          },
          {
            id: 'm4_2_6',
            text: 'Disposer de produits absorbants en cas de déversement accidentel ou fuite adapté au produit présent.'
          },
          {
            id: 'm4_2_7',
            text: 'Veiller à respecter les incompatibilités entre produits (par exemple dans des armoires de stockage différentes, ou au sein d\'une même armoire dans des rétention différentes).'
          },
          {
            id: 'm4_2_8',
            text: 'Tenir compte des températures de stockage des produits.'
          },
          {
            id: 'm4_2_9',
            text: 'Respecter les dates limites d\'utilisation.'
          },
          {
            id: 'm4_2_10',
            text: 'Mettre en place des moyens de détection et d\'extinction adaptés aux produits et au lieu de stockage.'
          }
        ],
        informationText: 'Un stockage inadapté des produits chimiques peut avoir des conséquences dramatiques : incendie, explosion, formation de gaz toxiques par mélange accidentel. Les incompatibilités chimiques doivent être strictement respectées. Par exemple, les acides ne doivent jamais être stockés avec des bases ou des produits oxydants. Les bacs de rétention permettent de contenir les fuites accidentelles et d\'éviter la pollution ou le contact avec d\'autres produits.'
      },
      {
        id: 'q4_3',
        text: 'Les mesures liées au stockage de produits chimiques inflammables ont-elles été prises ?',
        measures: [
          {
            id: 'm4_3_1',
            text: 'Stocker les produits inflammables dans un espace (armoire ou local) ventilé mécaniquement avec rejet à l\'extérieur.'
          },
          {
            id: 'm4_3_2',
            text: 'Installer un système d\'éclairage certifié ATEX avec le boitier de commande à l\'extérieur du local de produits inflammables si cette zone est classée à risque de formation d\'ATEX.'
          },
          {
            id: 'm4_3_3',
            text: 'Disposer de systèmes d\'évacuation et de lutte contre le feu appropriés (portes coupe-feu, extincteurs…).'
          }
        ],
        informationText: 'Les produits inflammables (solvants, peintures, diluants) sont très largement utilisés dans le traitement des métaux. Leurs vapeurs peuvent former avec l\'air des mélanges explosifs. Un stockage dans une armoire coupe-feu limite la propagation du feu en cas d\'incendie. Les atmosphères explosives (ATEX) nécessitent l\'utilisation de matériel électrique spécifique pour éviter toute source d\'ignition. Les extincteurs doivent être adaptés aux feux de liquides inflammables (classe B).'
      },
      {
        id: 'q4_4',
        text: 'Les mesures d\'urgence en cas d\'accident impliquant des produits chimiques sont-elles en place et connues de tous ?',
        measures: [
          {
            id: 'm4_4_1',
            text: 'Définir et communiquer les mesures d\'urgence à appliquer en cas d\'accident dû aux produits chimiques pour chaque lieu de travail où un risque chimique a été identifié.'
          },
          {
            id: 'm4_4_2',
            text: 'Mettre en place des moyens de secours tels que des douches de sécurité, des rince-œil à proximité des postes à risques… et les signaler (panneau de signalisation).'
          },
          {
            id: 'm4_4_3',
            text: 'S\'assurer que les équipements de premier soins (douches, rince-œil) permettent un rinçage efficace.'
          }
        ],
        informationText: 'En cas de contact avec un produit chimique dangereux, la rapidité d\'intervention est cruciale. Une projection d\'acide ou de base dans les yeux nécessite un rinçage immédiat et abondant (15 minutes minimum) pour limiter les lésions. Les douches de sécurité et fontaines oculaires doivent être accessibles en moins de 10 secondes depuis tout poste à risque. Les FDS indiquent les mesures de premiers secours spécifiques à chaque produit et doivent être consultées rapidement en cas d\'accident.'
      },
      {
        id: 'q4_5',
        text: 'Les règles d\'hygiène associées à l\'utilisation de produits chimiques sont-elles connues des salariés ?',
        measures: [
          {
            id: 'm4_5_1',
            text: 'Former les salariés aux règles d\'hygiène spécifiques à votre activité.'
          },
          {
            id: 'm4_5_2',
            text: 'Rappeler que le lavage des mains doit être réalisé avant les pauses avec des savons adaptés, proscrire l\'utilisation des solvants.'
          },
          {
            id: 'm4_5_3',
            text: 'Donner la consigne de ne pas boire, manger, fumer, se maquiller avec les mains contaminées ou sur le lieu de travail.'
          },
          {
            id: 'm4_5_4',
            text: 'Séparer les vêtements de ville des vêtements de travail.'
          },
          {
            id: 'm4_5_5',
            text: 'Porter des vêtements de travail adaptés à la tâche.'
          },
          {
            id: 'm4_5_6',
            text: 'Changer fréquemment les vêtements de travail, ne pas porter les vêtements imprégnés de poussières ou de produits chimiques.'
          },
          {
            id: 'm4_5_7',
            text: 'Organiser le nettoyage régulier des vêtements de travail par l\'employeur. Ne pas emporter les vêtements de travail contaminés à la maison.'
          },
          {
            id: 'm4_5_8',
            text: 'Maintenir les locaux propres.'
          },
          {
            id: 'm4_5_9',
            text: 'Entretenir et stocker les équipements de protection individuelle dans des emplacements propres et fermés.'
          }
        ],
        informationText: 'Les mesures d\'hygiène sont essentielles pour limiter l\'exposition aux produits chimiques. Des substances toxiques peuvent être ingérées involontairement en mangeant avec des mains souillées, ou être transportées au domicile via les vêtements de travail contaminés. La séparation stricte entre vêtements de ville et de travail évite la contamination de l\'environnement familial. Le nettoyage des vêtements de travail doit être assuré par l\'employeur pour éviter l\'exposition des familles et la pollution domestique.'
      }
    ]
  },
  {
    id: 'decapage_abrasifs',
    label: 'Décapage par abrasifs de pièces',
    defaultDescription: 'Le décapage par abrasifs (sablage, grenaillage) présente des risques spécifiques.\n\nCette partie traite des opérations de décapage par projection d\'abrasifs, des risques d\'exposition aux poussières, du bruit généré par ces opérations et des mesures de prévention appropriées (cabines de sablage, aspiration, protections auditives et respiratoires).',
    questions: [
      {
        id: 'q5_1',
        text: 'Les risques liés au grenaillage ou sablage des pièces sont-ils maîtrisés ?',
        measures: [
          {
            id: 'm5_1_1',
            text: 'Choisir des abrasifs non cancérogènes (ex. sans silice).'
          },
          {
            id: 'm5_1_2',
            text: 'Renouveler régulièrement l\'abrasif qui s\'enrichit avec les poussières métalliques.'
          },
          {
            id: 'm5_1_3',
            text: 'Utiliser de préférence une machine fermée avec opérateur à l\'extérieur.'
          },
          {
            id: 'm5_1_4',
            text: 'En cas d\'utilisation de cabine avec opérateur à l\'intérieur : adapter les enceintes à la dimension des pièces, assurer l\'isolement du traitement, équiper les cabines de projection d\'un système de ventilation (100 à 180 vol/h).'
          },
          {
            id: 'm5_1_5',
            text: 'Fournir et faire porter les équipements de protection individuelle adaptée : munir le salarié d\'une cagoule à adduction d\'air, d\'une double protection auditive (bouchons et casques) et d\'un tablier en cuir (à changer régulièrement).'
          },
          {
            id: 'm5_1_6',
            text: 'Équiper le réseau d\'air comprimé servant à alimenter cette cagoule de filtres afin de garantir une qualité d\'air saine à l\'opérateur.'
          },
          {
            id: 'm5_1_7',
            text: 'Si le salarié est en travail isolé dans une cabine dédiée, mettre en place des moyens de communication ou des moyens techniques / matériels tels que PTI (Protection du Travailleur Isolé) ou DATI (Dispositif d\'Alerte du Travailleur Isolé ). Voir la brochure INRS ED 6288 - Travail isolé. Pour une démarche globale de prévention.'
          }
        ],
        informationText: 'Le décapage par abrasifs (sablage, grenaillage) génère des poussières dangereuses pour les voies respiratoires. Ces poussières peuvent contenir des particules de silice cristalline, de métaux lourds ou de peintures anciennes (plomb, chrome). L\'inhalation prolongée de silice cristalline peut provoquer la silicose, une maladie pulmonaire irréversible et potentiellement mortelle. Le travail en cabine fermée avec aspiration efficace est la mesure de prévention la plus efficace. L\'utilisation d\'abrasifs sans silice libre (corindon, billes de verre, grenaille métallique) limite considérablement les risques.'
      }
    ]
  },
  {
    id: 'bains_traitement',
    label: 'Bains de traitement de surfaces (dégraissage, revêtement)',
    defaultDescription: 'Les opérations de traitement de surfaces par bains présentent des risques chimiques et physiques importants.\n\nCette partie traite des risques liés aux bains de traitement (dégraissage, décapage, phosphatation, chromation), notamment l\'exposition aux produits chimiques dangereux, les projections, les émanations de vapeurs toxiques et les mesures de prévention collective et individuelle.',
    questions: [
      {
        id: 'q6_1',
        text: 'Des mesures sont-elles prises pour limiter les risques liés à la mise au bain des pièces?',
        measures: [
          {
            id: 'm6_1_1',
            text: 'Mettre en place un système automatique ou semi-automatique de mise au bain des pièces limitant le contact du salarié avec les produits chimiques.'
          },
          {
            id: 'm6_1_2',
            text: 'Disposer des équipements de protection collectifs (ex. écrans entre les bains).'
          },
          {
            id: 'm6_1_3',
            text: 'Mettre en place des systèmes d\'aspiration localisée quelle que soit la température des bains.'
          },
          {
            id: 'm6_1_4',
            text: 'Vérifier régulièrement le bon fonctionnement de la ventilation des bains de traitement de surface.'
          },
          {
            id: 'm6_1_5',
            text: 'Prévoir les protections périmétriques afin d\'éviter la chute des opérateurs dans les cuves de traitement de surface.'
          },
          {
            id: 'm6_1_6',
            text: 'Mettre en place des équipements évitant le risque de glissade comme des caillebottis.'
          },
          {
            id: 'm6_1_7',
            text: 'Dans le cas de mise au bain manuelle, prévoir les équipements de protection individuelle adéquats vis vis des projections corps et visage ainsi qu\'une protection respiratoire.'
          },
          {
            id: 'm6_1_8',
            text: 'Veiller au marquage des bains par une signalisation (symbole de groupe de compatibilité). Pour plus d\'information, consulter la brochure INRS "ED 794 - Ateliers de traitement de surface. Guide d\'identification des cuves, canalisations et équipements".'
          },
          {
            id: 'm6_1_9',
            text: 'Établir un mode opératoire précis pour la manipulation des produits.'
          },
          {
            id: 'm6_1_10',
            text: 'Vider les cuves de rétention régulièrement.'
          }
        ],
        informationText: 'Les bains de traitement de surface (dégraissage, décapage, phosphatation, chromage, zingage) contiennent des produits chimiques dangereux et dégagent des vapeurs toxiques et corrosives. Les risques principaux sont les projections lors de la mise au bain des pièces, les brûlures chimiques par contact cutané, et l\'inhalation de vapeurs irritantes ou toxiques. La mise au bain de pièces froides dans un bain chaud peut provoquer des projections violentes. Le captage des vapeurs à la source et le port d\'EPI adaptés sont essentiels.'
      },
      {
        id: 'q6_2',
        text: 'En phase de dégraissage, les risques liés à l\'utilisation de solvants organiques halogénés sont-ils maîtrisés ?',
        measures: [
          {
            id: 'm6_2_1',
            text: 'Substituer les solvants halogénés les plus dangereux, si cela est techniquement possible par des solvants ou des procédés moins dangereux pour la santé des travailleurs.'
          },
          {
            id: 'm6_2_2',
            text: 'Travailler en machines fermées et étanches.'
          },
          {
            id: 'm6_2_3',
            text: 'Ventiler mécaniquement les locaux de travail.'
          },
          {
            id: 'm6_2_4',
            text: 'Éviter le travail manuel, sinon l\'effectuer à un poste de travail muni d\'un dispositif d\'aspiration des vapeurs à leur source d\'émission.'
          }
        ],
        informationText: 'Les solvants organiques halogénés (perchloroéthylène, trichloroéthylène, chlorure de méthylène) sont utilisés pour le dégraissage des pièces métalliques. Ces solvants présentent des risques graves pour la santé : neurotoxicité (troubles neurologiques, vertiges, maux de tête), atteintes du foie et des reins, et certains sont classés cancérogènes. Leur substitution par des procédés aqueux ou des solvants moins dangereux doit être recherchée en priorité. Les machines fermées avec récupération de vapeurs limitent considérablement l\'exposition.'
      },
      {
        id: 'q6_3',
        text: 'Les risques liés à l\'utilisation de solvants organiques non halogénés sont-ils maîtrisés ?',
        measures: [
          {
            id: 'm6_3_1',
            text: 'Mettre en place des systèmes d\'aspiration aux points d\'émission de vapeurs de solvants.'
          },
          {
            id: 'm6_3_2',
            text: 'Proscrire l\'application à chaud pour les produits à point éclair inférieur à 60 °C.'
          },
          {
            id: 'm6_3_3',
            text: 'Travailler exclusivement en machine fermée pour l\'application à chaud pour les solvants organiques non halogénés dont le point d\'éclair est supérieur à 60 °C.'
          },
          {
            id: 'm6_3_4',
            text: 'Pour l\'application à froid, limiter le travail manuel, réserver la pratique à des interventions ponctuelles et déconseiller la pulvérisation.'
          },
          {
            id: 'm6_3_5',
            text: 'Éloigner les postes de tout point chaud et éviter l\'accumulation de charges électrostatiques.'
          },
          {
            id: 'm6_3_6',
            text: 'Caractériser les zones à risques d\'explosion.'
          }
        ],
        informationText: 'Les solvants organiques non halogénés (white-spirit, acétone, alcools, cétones, hydrocarbures) sont également utilisés pour le dégraissage. Bien que généralement moins toxiques que les solvants halogénés, ils présentent des risques importants : inflammabilité et risque d\'explosion (formation de mélanges explosifs avec l\'air), effets narcotiques (vertiges, somnolence), irritations des voies respiratoires et de la peau. Certains comme le benzène sont cancérogènes. La prévention repose sur la ventilation efficace, l\'éloignement des sources d\'ignition et la limitation des quantités utilisées.'
      },
      {
        id: 'q6_4',
        text: 'Des mesures sont-elles prises pour limiter les risques liés à l\'utilisation de l\'acide fluorhydrique ?',
        measures: [
          {
            id: 'm6_4_1',
            text: 'Éviter le plus possible le recours aux produits contenant de l\'acide fluorhydrique ou susceptibles d\'en libérer, les remplacer par des produits dont la toxicité est moins élevée.'
          },
          {
            id: 'm6_4_2',
            text: 'Concevoir le poste de traitement de surface de façon à limiter autant que possible la distance entre le bain et la suite du traitement (installation de leviers mécaniques, supports de pièces…).'
          },
          {
            id: 'm6_4_3',
            text: 'Privilégier le travail automatisé, en appareil clos.'
          },
          {
            id: 'm6_4_4',
            text: 'Privilégier les installations automatiques pour les ajouts de réactifs (pompes doseuses, etc.) et l\'utilisation de tuyauteries fixes et rigides pour le transfert d\'acide fluorhydrique avec une identification claire. Bannir l\'utilisation de tuyauteries flexibles.'
          },
          {
            id: 'm6_4_5',
            text: 'Installer une aspiration localisée des vapeurs et aérosols produits.'
          },
          {
            id: 'm6_4_6',
            text: 'Inspecter régulièrement les installations contenant de l\'acide fluorhydrique afin d\'éviter toute fuite ou détérioration des joints ou des canalisations.'
          },
          {
            id: 'm6_4_7',
            text: 'Fournir et faire porter les équipements de protection individuelle recommandés (écran facial, appareil de protection respiratoire, gants, bottes, vêtement de protection résistant aux brouillards voire aux projections d\'acide fluorhydrique, selon le risque d\'exposition).'
          },
          {
            id: 'm6_4_8',
            text: 'Installer des lavabos, douches de sécurité et fontaines oculaires sur les lieux de travail où sont mises en œuvre des solutions aqueuses d\'acide fluorhydrique.'
          },
          {
            id: 'm6_4_9',
            text: 'Mettre à disposition immédiate, une trousse de secours pour brûlures chimiques (protocole à établir avec le médecin du travail).'
          },
          {
            id: 'm6_4_10',
            text: 'Avoir à disposition du gel de gluconate de calcium, en concertation avec le service de santé au travail.'
          },
          {
            id: 'm6_4_9',
            text: 'Organiser un suivi médical spécifique pour les salariés exposés.'
          },
          {
            id: 'm6_4_10',
            text: 'Limiter le nombre de personnes autorisées à manipuler l\'acide fluorhydrique.'
          }
        ],
        informationText: 'L\'acide fluorhydrique (HF) est l\'un des produits chimiques les plus dangereux utilisés dans le traitement de surface des métaux (décapage de l\'acier inoxydable, gravure). Il provoque des brûlures chimiques extrêmement graves et insidieuses : la douleur peut n\'apparaître que plusieurs heures après le contact, alors que le produit a déjà pénétré profondément dans les tissus. L\'acide fluorhydrique peut provoquer des lésions osseuses, des troubles du rythme cardiaque potentiellement mortels, même lors de contacts sur de petites surfaces. Les vapeurs sont très irritantes pour les voies respiratoires. La substitution doit être recherchée en priorité absolue. En cas de contact, le rinçage immédiat et l\'application de gel de gluconate de calcium sont vitaux, suivis d\'une hospitalisation urgente.'
      }
    ]
  },
  {
    id: 'revetement_peinture',
    label: 'Revêtement par peinture',
    defaultDescription: 'Les opérations de peinture, comprenant la préparation des produits, l\'application de peintures et le nettoyage des outils, présentent des risques pour les opérateurs.',
    questions: [
      {
        id: 'q7_3',
        displayNumber: '7.1',
        text: 'Peinture en poudre',
        isYesNoOnly: true,
        yesNoQuestion: 'Utilisez-vous de la peinture en poudre dans le cadre de votre activité ?',
        measures: [],
        informationText: 'La peinture en poudre est composée de particules fines qui peuvent être inhalées lors de l\'application. Les principales expositions se produisent lors de l\'application par pulvérisation électrostatique et lors du nettoyage des installations.'
      },
      {
        id: 'q7_4',
        displayNumber: '7.1.1',
        text: 'Le risque lié à la mise en œuvre de peinture en poudre est-il pris en compte ?',
        measures: [
          {
            id: 'm7_4_1',
            text: 'Réaliser l\'application de peinture en poudre dans une cabine fermée avec extraction d\'air.'
          },
          {
            id: 'm7_4_2',
            text: 'Mettre en place un système de récupération et recyclage automatique de la poudre.'
          },
          {
            id: 'm7_4_3',
            text: 'Nettoyer régulièrement la cabine et les équipements par aspiration (éviter le soufflage à l\'air comprimé).'
          },
          {
            id: 'm7_4_4',
            text: 'Équiper les salariés d\'une combinaison de protection adaptée et d\'un masque de protection respiratoire FFP2 minimum lors des opérations d\'application et de nettoyage.'
          },
          {
            id: 'm7_4_5',
            text: 'Former et informer les salariés sur les risques liés à l\'inhalation de poudre et les bonnes pratiques de travail.'
          },
          {
            id: 'm7_4_6',
            text: 'Vérifier régulièrement l\'efficacité du système de ventilation et d\'extraction.'
          }
        ],
        informationText: 'La peinture en poudre doit être appliquée dans une cabine fermée équipée d\'un système d\'extraction efficace. Le recyclage automatique de la poudre limite l\'exposition des opérateurs.\n\nLe nettoyage doit être réalisé par aspiration et non par soufflage pour éviter la mise en suspension des particules. Pour en savoir plus, consulter le guide INRS "ED 6374 - Peinture en poudre. Prévenir les risques".'
      },
      {
        id: 'q7_1',
        displayNumber: '7.2',
        text: 'Peinture liquide',
        isYesNoOnly: true,
        yesNoQuestion: 'Utilisez-vous de la peinture liquide dans le cadre de votre activité ?',
        measures: [],
        informationText: 'Les peintures liquides à base d\'eau ou de solvant sont à l\'origine d\'émission d\'aérosols lors de leur préparation et de leur mise en œuvre par projection.'
      },
      {
        id: 'q7_2',
        displayNumber: '7.2.1',
        text: 'Le risque lié à la mise en œuvre de peinture liquide est-il pris en compte ?',
        measures: [
          {
            id: 'm7_2_1',
            text: 'Préparer les mélanges de peintures dans un emplacement ventilé.'
          },
          {
            id: 'm7_2_2',
            text: 'Réaliser la mise en peinture dans une cabine fermée à ventilation verticale.'
          },
          {
            id: 'm7_2_3',
            text: 'Dans une cabine à ventilation horizontale, veiller à ce que l\'opérateur ne soit jamais dans le flux d\'air extrait (utilisation d\'un support tournant).'
          },
          {
            id: 'm7_2_4',
            text: 'Équiper le salarié d\'une combinaison de protection jetable adaptée et d\'un masque de protection respiratoire avec cartouches filtrantes adaptées au produit utilisé.'
          },
          {
            id: 'm7_2_5',
            text: 'Former et informer les salariés sur les risques liés à la mise en œuvre de peinture liquide (notamment par la notice de poste).'
          }
        ],
        informationText: 'Les peintures liquides appliquées par pulvérisation doivent être préparées dans un box de préparation de peinture et être appliquées de préférence en cabine fermée à ventilation verticale.\n\nPour en savoir plus, consulter les guides pratiques de ventilation INRS "ED 839 - Cabines d\'application par pulvérisation de produits liquides" et "ED 906 - Pulvérisation de produits liquides. Objets lourds ou encombrants".'
      },
      {
        id: 'q7_5',
        displayNumber: '7.2.2',
        text: 'Le risque lié à la mise en œuvre de peinture en poudre est-il pris en compte ?',
        measures: [
          {
            id: 'm7_5_1',
            text: 'Réaliser la mise en peinture dans une cabine fermée à ventilation verticale avec opérateur à l\'extérieur.'
          },
          {
            id: 'm7_5_2',
            text: 'A défaut, réaliser la mise en peinture dans une cabine à ventilation horizontale ouverte avec opérateur à l\'extérieur.'
          },
          {
            id: 'm7_5_3',
            text: 'Positionner la pièce à peindre sur un support, tournant si nécessaire.'
          },
          {
            id: 'm7_5_4',
            text: 'Installer deux pans aspirants permettant à l\'opérateur de peindre les deux faces de la pièce sans être exposé aux poudres.'
          }
        ],
        informationText: 'Les peintures en poudre appliquées par pulvérisation génèrent des aérosols en quantité importante.\n\nPour en savoir plus, consulter le guide pratique de ventilation INRS "<a href="https://www.inrs.fr/media.html?refINRS=ED%20928" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">ED 928 - Cabines d\'application par projection de peintures en poudre</a>".'
      }
    ]
  },
  {
    id: 'deplacements_risque',
    label: 'Déplacements, risque routier',
    defaultDescription: 'Le risque routier est la première cause d\'accidents mortels au travail.\n\nCette partie traite des déplacements professionnels (trajets domicile-travail et missions), de l\'état des véhicules, de l\'organisation des déplacements, de la formation des conducteurs et des mesures de prévention du risque routier (entretien des véhicules, sensibilisation, gestion de la fatigue).',
    questions: [
      {
        id: 'q8',
        displayNumber: '8',
        text: 'Déplacements, risque routier',
        isYesNoOnly: true,
        yesNoQuestion: 'Vos salariés sont-ils amenés à se déplacer (en clientèle, chez des fournisseurs...) ?',
        measures: [],
        informationText: 'Conduire pour son travail entraîne des contraintes particulières et expose à des risques professionnels au premier rang desquels les accidents de la route, à l\'origine de plus de 20% des accidents mortels du travail.'
      },
      {
        id: 'q8_1',
        displayNumber: '8.1',
        text: 'Des mesures sont-elles prévues pour limiter le risque d\'accident de la route notamment pour les interventions chez les clients ?',
        measures: [
          {
            id: 'm8_1_1',
            text: 'Organiser les plannings et trajets de façon à optimiser les temps de conduite, planifier des temps de repos.'
          },
          {
            id: 'm8_1_2',
            text: 'Fixer les plages d\'appel pendant les temps de travail autre que la conduite.'
          },
          {
            id: 'm8_1_3',
            text: 'Réaliser une sensibilisation des salariés concernant le risque routier, et leur faire suivre une formation spécifique le cas échéant (conduite sur sols glissants…).'
          },
          {
            id: 'm8_1_4',
            text: 'Sensibiliser aux risques liés aux conduites addictives (consommation d\'alcool et de drogues).'
          },
          {
            id: 'm8_1_5',
            text: 'Vérifier le carnet d\'entretien ou carnet de bord du véhicule.'
          },
          {
            id: 'm8_1_6',
            text: 'Attacher les outils dans les véhicules ou séparer l\'habitacle du coffre (ex. filet ou cloison fixe). Entretenir les véhicules (révision, contrôle technique…).'
          }
        ],
        informationText: 'La prévention du risque routier consiste à agir sur différentes dimensions : les déplacements, les communications, l\'état des véhicules et les compétences des salariés à la conduite.'
      }
    ]
  },
  {
    id: 'organisation_sst',
    label: 'Organisation de la Santé et Sécurité au Travail',
    defaultDescription: 'L\'employeur doit prendre des mesures visant la protection des travailleurs telles que l\'organisation des premiers secours, l\'accueil des nouveaux embauchés ou des salariés extérieurs à l\'entreprise (maintenance, nettoyage…).',
    questions: [
      {
        id: 'q9_1',
        text: 'Les nouveaux embauchés, salariés temporaires et apprentis sont-ils accueillis et informés sur la sécurité et la santé au travail ?',
        measures: [
          {
            id: 'm9_1_1',
            text: 'Organiser l\'accueil "sécurité" des nouveaux embauchés, en particulier les collègues saisonniers ou intérimaires présents au moment d\'un surcroît d\'activité par exemple.'
          },
          {
            id: 'm9_1_2',
            text: 'Organiser des séances d\'informations sur les risques et les moyens de prévention (notamment pour les dorsalgies, tendinites, coupures, projections oculaires, brûlures...).'
          },
          {
            id: 'm9_1_3',
            text: 'Organiser ces séances d\'informations lors d\'un changement de poste et lors de la reprise d\'une activité après un arrêt de travail.'
          },
          {
            id: 'm9_1_4',
            text: 'Former les nouveaux embauchés au(x) poste(s) de travail (avec l\'aide d\'un tuteur) sur les risques liés à l\'activité.'
          }
        ],
        informationText: 'Les salariés ayant moins d\'un an d\'ancienneté sont particulièrement exposés aux risques d\'accidents. Il faut donc être particulièrement attentif à eux. Des formations à la sécurité doivent être mise en place lors de l\'embauche d\'un salarié ou d\'un intérimaire, mais aussi lors d\'un changement de poste et lors de la reprise d\'une activité après un arrêt de travail.'
      },
      {
        id: 'q9_2',
        text: 'Existe-t-il une procédure connue pour gérer les situations d\'urgence ?',
        measures: [
          {
            id: 'm9_2_1',
            text: 'Mettre en place un plan et des procédures d\'évacuation définissant la gestion des urgences, les afficher et les faire connaître.'
          },
          {
            id: 'm9_2_2',
            text: 'Former des salariés au sauvetage secourisme du travail et afficher la liste de ces Sauveteurs Secouristes du Travail.'
          },
          {
            id: 'm9_2_3',
            text: 'Disposer dans l\'établissement d\'une trousse de premiers secours (contenu à faire valider par le Médecin du Travail).'
          }
        ],
        informationText: 'En cas d\'accident ou de malaise, il est important que les salariés sachent comment réagir rapidement.'
      },
      {
        id: 'q9_3',
        text: 'Un protocole d\'accueil des salariés extérieurs à votre entreprise (maintenance, nettoyage…) est-il organisé ?',
        measures: [
          {
            id: 'm9_3_1',
            text: 'Organiser une inspection commune des lieux, des installations et des matériels mis à disposition.'
          },
          {
            id: 'm9_3_2',
            text: 'Réaliser une visite commune du site pour évaluer les risques d\'interférence entre les personnels, installations et matériels lorsque plusieurs entreprises interviennent sur un même lieu de travail.'
          },
          {
            id: 'm9_3_3',
            text: 'Élaborer le plan de prévention et le diffuser avant de le faire appliquer.'
          },
          {
            id: 'm9_3_4',
            text: 'Accueillir les intervenants, désigner un référent.'
          },
          {
            id: 'm9_3_5',
            text: 'Effectuer des audits des interventions et rédiger un bon d\'intervention en cas de modification de travaux, de nouveaux risques détectés ou de tous problèmes rencontrés.'
          }
        ],
        informationText: 'Travailler dans un autre établissement, dans des locaux inconnus, où sont exercées des activités souvent étrangères aux activités habituelles, entraîne des risques supplémentaires.\n\nIl est important que les salariés soient accueillis pour les informer sur les lieux où ils vont accéder, les consignes de sécurité propres à l\'établissement et les machines à entretenir ou réparer.'
      },
      {
        id: 'q9_4',
        text: 'L\'ambiance de travail est-elle calme et les échanges respectueux ?',
        measures: [
          {
            id: 'm9_4_1',
            text: 'Maintenir un bon équilibre entre les ressources disponibles et la charge de travail, anticiper les périodes de forte activité.'
          },
          {
            id: 'm9_4_2',
            text: 'Définir clairement la répartition des tâches.'
          },
          {
            id: 'm9_4_3',
            text: 'Assurer une bonne adéquation entre compétences et tâches à effectuer.'
          },
          {
            id: 'm9_4_4',
            text: 'Désamorcer si besoin les situations de conflits par le dialogue direct et le rappel des règles aux personnes concernées.'
          },
          {
            id: 'm9_4_5',
            text: 'Favoriser les échanges et l\'entraide entre les salariés.'
          },
          {
            id: 'm9_4_6',
            text: 'Informer au plus tôt le client de tout dépassement de délai ou de coût.'
          },
          {
            id: 'm9_4_7',
            text: 'Mettre en place, si possible, un accueil dans une zone dédiée, dans laquelle le salarié chargé de la réception des clients n\'est pas isolé.'
          },
          {
            id: 'm9_4_8',
            text: 'Identifier et désigner une personne qui, en cas de conflit, pourra intervenir, en appui du salarié agressé.'
          }
        ],
        informationText: 'Une ambiance de travail dégradée peut entraîner des dysfonctionnements, du stress et des conflits qui peuvent exposer les salariés à des risques psychosociaux.\n\nLa possibilité de partager les façons de faire sur le travail offre une bonne opportunité de lever des craintes et des interrogations, facteurs de crispation.\n\nPour approfondir l\'évaluation des risques psychosociaux dans votre entreprise, se reporter à l\'outil INRS "Faire le point RPS".'
      },
      {
        id: 'q9_5',
        text: 'Des mesures de prévention adaptées sont-elles mises en place en cas de travail de nuit ou en horaires décalés ?',
        measures: [
          {
            id: 'm9_5_1',
            text: 'Agir sur les horaires de travail.'
          },
          {
            id: 'm9_5_2',
            text: 'Raccourcir la durée des postes de nuit, repousser le plus possible l\'heure de prise de poste du matin (après 6 heures) et prévoir un minimum de 11 heures de repos entre 2 postes.'
          },
          {
            id: 'm9_5_3',
            text: 'Éviter les postes longs la nuit (< à 8h).'
          },
          {
            id: 'm9_5_4',
            text: 'Instituer un temps d\'échange informel lors de la relève des postes entre les équipes qui se succèdent afin de permettre la transmission des informations utiles à la sécurité et à la qualité du travail.'
          },
          {
            id: 'm9_5_5',
            text: 'Informer les salariés sur le déficit de sommeil et ses conséquences.'
          },
          {
            id: 'm9_5_6',
            text: 'Choisir, de préférence, des salariés volontaires pour le travail de nuit.'
          },
          {
            id: 'm9_5_7',
            text: 'Mettre en place des mesures pour assurer la sécurité du travailleur isolé.'
          }
        ],
        informationText: 'Travailler en horaires atypiques, et notamment la nuit, n\'est pas anodin pour la santé, la sécurité et les conditions de travail des salariés. En effet, le travail de nuit peut provoquer, entre autres, une somnolence, une baisse de vigilance, des troubles de la concentration et de la mémorisation.\n\nLe travail de nuit est responsable d\'une dette chronique de sommeil et de désynchronisations internes qui peuvent entraîner une baisse de vigilance, des troubles de la concentration et de la mémorisation. Les salariés sont surexposés au risque d\'accidents : les accidents de la route entre le lieu de travail et le domicile constituent le principal danger.'
      },
      {
        id: 'q9_6',
        text: 'Des mesures sont-elles prévues pour prévenir le risque d\'incendie et d\'explosion ?',
        measures: [
          {
            id: 'm9_6_1',
            text: 'Identifier les sources potentielles d\'incendie et définir les précautions à prendre.'
          },
          {
            id: 'm9_6_2',
            text: 'Réaliser des permis de feu pour les points chauds (soudage, meulage...).'
          },
          {
            id: 'm9_6_3',
            text: 'Identifier les zones à risque de formation d\'ATEX et intégrer le matériel conforme à la réglementation ATEX dans ces zones (stockage de produits chimiques inflammables).'
          },
          {
            id: 'm9_6_4',
            text: 'Disposer des moyens d\'extinction adaptés.'
          },
          {
            id: 'm9_6_5',
            text: 'Former et informer les salariés à la manipulation des moyens d\'extinction.'
          },
          {
            id: 'm9_6_6',
            text: 'Prévoir une consigne d\'évacuation et identifier un point de rassemblement à l\'extérieur des locaux de travail.'
          },
          {
            id: 'm9_6_7',
            text: 'Maintenir dégagées les issues de secours et les accès aux extincteurs.'
          },
          {
            id: 'm9_6_8',
            text: 'Contacter le SDIS (Service Départemental d\'Incendie et de Secours) afin de voir l\'opportunité d\'une visite commune avec les pompiers.'
          }
        ],
        informationText: 'L\'utilisation de solvants ou de produits inflammables peut être à l\'origine d\'incendie. La mise en suspension de poussières fines, le dégagement de gaz inflammable ou l\'évaporation de liquides inflammables peut être à l\'origine de la formation d\'une atmosphère explosive.'
      }
    ]
  },
  {
    id: 'risques_personnalises',
    label: 'Risques personnalisés',
    defaultDescription: 'Si vous avez identifié des risques qui ne sont pas abordés par l\'outil, vous pouvez les ajouter ici.\n\nImportant: Afin d\'éviter les doublons, nous vous recommandons au préalable de bien parcourir l\'ensemble des modules si ce n\'est déjà fait.\n\nSi vous ne devez pas ajouter de risques, veuillez continuer.',
    questions: []
  }
];
