import type { SkillDef, SkillName } from '../types';

/** Background skill list (page 9). */
export const BACKGROUND_SKILLS: readonly SkillName[] = [
  'Admin',
  'Animals',
  'Art',
  'Athletics',
  'Carouse',
  'Drive',
  'Electronics',
  'Flyer',
  'Language',
  'Mechanic',
  'Medic',
  'Profession',
  'Science',
  'Seafarer',
  'Streetwise',
  'Survival',
  'Vacc Suit',
] as const;

/**
 * Skill metadata transcribed from the Mongoose Traveller 2022 Skills chapter.
 * Specializations follow the Skills book exactly; legacy spec strings on existing
 * SkillEntry records still work because spec is a free string field.
 */
export const SKILLS: Record<SkillName, SkillDef> = {
  Admin: {
    name: 'Admin',
    specs: [],
    hasParent: true,
    description:
      'Bureaucracies and administration of all sorts, including navigating bureaucratic obstacles or disasters. Also covers tracking inventories, ship manifests and other records.',
    tasks: [
      { name: 'Avoid close examination of papers', difficulty: 'average', characteristic: ['EDU', 'SOC'], timeframe: '1D × 10 seconds' },
      { name: 'Deal with police harassment', difficulty: 'difficult', characteristic: ['EDU', 'SOC'], timeframe: '1D × 10 minutes' },
    ],
  },

  Advocate: {
    name: 'Advocate',
    specs: [],
    hasParent: true,
    description:
      'Knowledge of common legal codes and practices, especially interstellar law. Also gives experience in oratory, debate and public speaking — excellent for lawyers and politicians.',
    tasks: [
      { name: 'Argue in court', difficulty: 'average', characteristic: ['EDU', 'SOC'], timeframe: '1D days', opposed: 'Advocate' },
      { name: 'Debate an argument', difficulty: 'average', characteristic: 'INT', timeframe: '1D × 10 minutes', opposed: 'Advocate' },
    ],
  },

  Animals: {
    name: 'Animals',
    specs: ['handling', 'veterinary', 'training'],
    hasParent: true,
    description:
      'The care of animals — rare on industrialised or technologically advanced worlds.',
    specDescriptions: {
      handling: 'Handling and riding animals trained to bear a rider. Unusual animals raise the difficulty.',
      veterinary: 'Trained in veterinary medicine and animal care; works like Medic but for animals.',
      training: 'Knows how to tame and train animals.',
    },
    tasks: [
      { name: 'Ride a horse into battle', difficulty: 'difficult', characteristic: 'DEX', timeframe: '1D seconds', spec: 'handling' },
      { name: 'Tame a strange alien creature', difficulty: 'formidable', characteristic: 'INT', timeframe: '1D days', spec: 'training' },
    ],
  },

  Art: {
    name: 'Art',
    specs: ['performer', 'holography', 'instrument', 'visual media', 'write'],
    hasParent: true,
    description:
      'Trained in a creative art. The Traveller picks a specialty matching the medium they work in.',
    specDescriptions: {
      performer: 'Actor, dancer, or singer at home on stage, screen or holo.',
      holography: 'Recording and producing aesthetically pleasing and clear holographic images.',
      instrument: 'Playing a particular musical instrument such as flute, piano or organ.',
      'visual media': 'Making artistic or abstract paintings or sculptures in a variety of media.',
      write: 'Composing inspiring or interesting pieces of text.',
    },
    tasks: [
      { name: 'Perform a play', difficulty: 'average', characteristic: 'EDU', timeframe: '1D hours', spec: 'performer' },
      { name: 'Convince someone you are someone else', characteristic: 'INT', difficulty: 'average', timeframe: '1D × 10 minutes', spec: 'performer', opposed: 'Recon' },
      { name: 'Play a concerto', difficulty: 'difficult', characteristic: 'EDU', timeframe: '1D × 10 minutes', spec: 'instrument' },
    ],
  },

  Astrogation: {
    name: 'Astrogation',
    specs: [],
    hasParent: true,
    description:
      'Plotting the courses of starships and calculating accurate jumps. See the Spacecraft Operations chapter for details.',
    tasks: [
      { name: 'Plot a course using a gas-giant slingshot', difficulty: 'difficult', characteristic: 'EDU', timeframe: '1D × 10 minutes' },
      { name: 'Plot a standard jump', difficulty: 'easy', characteristic: 'EDU', timeframe: '1D × 10 minutes' },
    ],
  },

  Athletics: {
    name: 'Athletics',
    specs: ['dexterity', 'endurance', 'strength'],
    hasParent: true,
    description:
      'A trained athlete who is physically fit. Athletics augments physical characteristics: whatever you can do with raw STR/DEX/END you can also add the matching Athletics specialty DM to. Also the principal skill for adverse-gravity environments — Athletics (dexterity) in low/zero-G, Athletics (strength) in high-G.',
    specDescriptions: {
      dexterity: 'Climbing, juggling, throwing, sprinting, jumping. For winged species this also covers flying.',
      endurance: 'Long-distance running, hiking, swimming.',
      strength: 'Feats of strength, weightlifting, complex tasks in high-G.',
    },
    tasks: [
      { name: 'Sprint', difficulty: 'average', characteristic: 'DEX', timeframe: '1D seconds', spec: 'dexterity' },
      { name: 'Long-distance running', difficulty: 'average', characteristic: 'END', timeframe: '1D × 10 minutes', spec: 'endurance' },
      { name: 'Arm wrestling', difficulty: 'average', characteristic: 'STR', timeframe: '1D minutes', spec: 'strength', opposed: 'Athletics' },
    ],
  },

  Broker: {
    name: 'Broker',
    specs: [],
    hasParent: true,
    description:
      'Negotiating trades and arranging fair deals. Heavily used in the Trade chapter.',
    tasks: [
      { name: 'Negotiate a deal', difficulty: 'average', characteristic: 'INT', timeframe: '1D hours' },
      { name: 'Find a buyer', difficulty: 'average', characteristic: 'SOC', timeframe: '1D hours' },
    ],
  },

  Carouse: {
    name: 'Carouse',
    specs: [],
    hasParent: true,
    description:
      'The art of socialising — having fun, ensuring others have fun, and infectious good humour. Also covers social awareness and subterfuge in such situations.',
    tasks: [
      { name: 'Drink someone under the table', difficulty: 'average', characteristic: 'END', timeframe: '1D hours', opposed: 'Carouse' },
      { name: 'Gather rumours at a party', difficulty: 'average', characteristic: 'SOC', timeframe: '1D hours' },
    ],
  },

  Deception: {
    name: 'Deception',
    specs: [],
    hasParent: true,
    description:
      'Lying fluently, disguise, sleight of hand and fooling onlookers. Most underhanded ways of cheating and lying fall under Deception.',
    tasks: [
      { name: 'Convince a guard to let you past without ID', difficulty: 'very_difficult', characteristic: 'INT', timeframe: '1D minutes', opposed: 'Recon' },
      { name: 'Palm a credit chit', difficulty: 'average', characteristic: 'DEX', timeframe: '1D seconds' },
    ],
  },

  Diplomat: {
    name: 'Diplomat',
    specs: [],
    hasParent: true,
    description:
      'Negotiating deals, establishing peaceful contact and smoothing over social faux pas. Includes high-society etiquette and proper forms of address for nobles. A more formal skill than Persuade.',
    tasks: [
      { name: 'Greet the Emperor properly', difficulty: 'difficult', characteristic: 'SOC', timeframe: '1D minutes' },
      { name: 'Negotiate a peace treaty', difficulty: 'average', characteristic: 'EDU', timeframe: '1D days' },
    ],
  },

  Drive: {
    name: 'Drive',
    specs: ['hovercraft', 'mole', 'track', 'walker', 'wheel'],
    hasParent: true,
    description:
      'Controlling ground vehicles of various types.',
    specDescriptions: {
      hovercraft: 'Vehicles using a cushion of air and thrusters for motion.',
      mole: 'Vehicles that move through solid matter via drills, plasma torches, or cavitation.',
      track: 'Tanks and other tracked vehicles.',
      walker: 'Vehicles that use two or more legs to manoeuvre.',
      wheel: 'Automobiles and similar groundcars.',
    },
    tasks: [
      { name: 'Drive a tank into a cargo bay', difficulty: 'average', characteristic: 'DEX', timeframe: '1D × 10 seconds', spec: 'track' },
      { name: 'Avoid an unexpected obstacle on the road', difficulty: 'average', characteristic: 'DEX', timeframe: '1D seconds', spec: 'wheel' },
    ],
  },

  Electronics: {
    name: 'Electronics',
    specs: ['comms', 'computers', 'remote ops', 'sensors'],
    hasParent: true,
    description:
      'Operating electronic devices — computers, ship-board systems and similar gear. Higher levels represent the ability to repair and create electronic devices and systems.',
    specDescriptions: {
      comms: 'Telecommunications: opening channels, querying networks, jamming signals, starport protocols.',
      computers: 'Using and controlling computer systems and similar electrics.',
      'remote ops': 'Telepresence — remotely controlling drones, missiles, robots and other devices.',
      sensors: 'Use and interpretation of data from electronic sensors, observation satellites, and probes.',
    },
    tasks: [
      { name: 'Request landing privileges at a starport', difficulty: 'routine', characteristic: 'EDU', timeframe: '1D minutes', spec: 'comms' },
      { name: 'Hack a secure computer network', difficulty: 'formidable', characteristic: 'INT', timeframe: '1D × 10 hours', spec: 'computers' },
      { name: 'Make a detailed sensor scan', difficulty: 'routine', characteristic: ['INT', 'EDU'], timeframe: '1D × 10 minutes', spec: 'sensors' },
    ],
  },

  Engineer: {
    name: 'Engineer',
    specs: ['m-drive', 'j-drive', 'life support', 'power'],
    hasParent: true,
    description:
      'Operating and maintaining spacecraft and advanced vehicles. For repairs on simpler machines, use Mechanic.',
    specDescriptions: {
      'm-drive': 'Maintaining and operating a spacecraft\'s manoeuvre drive and artificial gravity.',
      'j-drive': 'Maintaining and operating a spacecraft\'s jump drive.',
      'life support': 'Oxygen generators, heating, lighting and other necessary life support systems.',
      power: 'Maintaining and operating a spacecraft\'s power plant.',
    },
    tasks: [
      { name: 'Make a jump', difficulty: 'easy', characteristic: 'EDU', timeframe: '1D × 10 minutes', spec: 'j-drive' },
      { name: 'Overcharge a thruster plate to increase agility', difficulty: 'difficult', characteristic: 'INT', timeframe: '1D minutes', spec: 'm-drive' },
    ],
  },

  Explosives: {
    name: 'Explosives',
    specs: [],
    hasParent: true,
    description:
      'The use of demolition charges and other explosive devices, including assembling and disarming bombs. A failed Explosives check with an Effect of −4 or less can result in premature detonation.',
    tasks: [
      { name: 'Plant a breaching charge', difficulty: 'average', characteristic: 'EDU', timeframe: '1D × 10 seconds' },
      { name: 'Disarm an anti-tamper bomb', difficulty: 'formidable', characteristic: 'DEX', timeframe: '1D minutes' },
    ],
  },

  Flyer: {
    name: 'Flyer',
    specs: ['airship', 'grav', 'ornithopter', 'rotor', 'wing'],
    hasParent: true,
    description:
      'Flying vehicles in atmosphere. Vehicles that leave atmosphere and reach orbit generally use Pilot instead.',
    specDescriptions: {
      airship: 'Airships, dirigibles, and other powered lighter-than-air craft.',
      grav: 'Air/rafts, grav belts, and other gravitic vehicles.',
      ornithopter: 'Vehicles that fly via flapping wings.',
      rotor: 'Helicopters, tilt-rotors, aerodynes.',
      wing: 'Jets, vectored-thrust aircraft, lifting-body aeroplanes.',
    },
    tasks: [
      { name: 'Land safely', difficulty: 'routine', characteristic: 'DEX', timeframe: '1D minutes' },
      { name: 'Race another flyer', difficulty: 'average', characteristic: 'DEX', timeframe: '1D × 10 minutes', opposed: 'Flyer' },
    ],
  },

  Gambler: {
    name: 'Gambler',
    specs: [],
    hasParent: true,
    description:
      'Familiar with a wide variety of gambling games — poker, roulette, blackjack, sports betting — with an excellent grasp of statistics and probability. Gambler 1+ grants DM+1 to cash benefit rolls during mustering out.',
    tasks: [
      { name: 'A casual game of poker', difficulty: 'average', characteristic: 'INT', timeframe: '1D hours', opposed: 'Gambler' },
      { name: 'Pick the right horse to bet on', difficulty: 'average', characteristic: 'INT', timeframe: '1D minutes' },
    ],
  },

  'Gun Combat': {
    name: 'Gun Combat',
    specs: ['archaic', 'energy', 'slug'],
    hasParent: true,
    description:
      'Ranged weapon combat. See the Combat chapter for details on using guns.',
    specDescriptions: {
      archaic: 'Primitive weapons that are not thrown — bows, blowpipes.',
      energy: 'Advanced energy weapons like laser pistols or plasma rifles.',
      slug: 'Weapons that fire solid projectiles — autorifle, gauss rifle.',
    },
    tasks: [
      { name: 'Fire a gun', difficulty: 'average', characteristic: 'DEX', timeframe: '1D seconds' },
    ],
  },

  Gunner: {
    name: 'Gunner',
    specs: ['turret', 'ortillery', 'screen', 'capital'],
    hasParent: true,
    description:
      'Operating ship-mounted weapons in space combat. Most Travellers crew smaller ships equipped solely with turret weapons.',
    specDescriptions: {
      turret: 'Operating turret-mounted weapons on board a ship.',
      ortillery: 'Orbital artillery — using a ship\'s weapons for planetary bombardment or attacks on stationary targets.',
      screen: 'Activating and using a ship\'s energy screens like Black Globe generators or meson screens.',
      capital: 'Operating bay or spinal mount weapons on board a ship.',
    },
    tasks: [
      { name: 'Fire a turret at an enemy ship', difficulty: 'average', characteristic: 'DEX', timeframe: '1D seconds', spec: 'turret' },
      { name: 'Fire a spinal mount weapon', difficulty: 'average', characteristic: 'INT', timeframe: '1D minutes', spec: 'capital' },
    ],
  },

  'Heavy Weapons': {
    name: 'Heavy Weapons',
    specs: ['artillery', 'portable', 'vehicle'],
    hasParent: true,
    description:
      'Portable and larger weapons that cause extreme property damage — rocket launchers, artillery, large plasma weapons.',
    specDescriptions: {
      artillery: 'Fixed guns, mortars, and other indirect-fire weapons.',
      portable: 'Missile launchers, flamethrowers, and portable fusion or plasma guns.',
      vehicle: 'Large weapons mounted on vehicles or strongpoints — tank guns, autocannon.',
    },
    tasks: [
      { name: 'Fire artillery at a visible target', difficulty: 'average', characteristic: 'DEX', timeframe: '1D seconds', spec: 'artillery' },
      { name: 'Fire artillery using indirect fire', difficulty: 'difficult', characteristic: 'INT', timeframe: '1D × 10 seconds', spec: 'artillery' },
    ],
  },

  Investigate: {
    name: 'Investigate',
    specs: [],
    hasParent: true,
    description:
      'Keen observation, forensics, and detailed analysis.',
    tasks: [
      { name: 'Search a crime scene for clues', difficulty: 'average', characteristic: 'INT', timeframe: '1D × 10 minutes' },
      { name: 'Watch security monitors for a specific criminal', difficulty: 'difficult', characteristic: 'INT', timeframe: '1D hours' },
    ],
  },

  'Jack-of-all-Trades': {
    name: 'Jack-of-all-Trades',
    specs: [],
    hasParent: true,
    notTrainable: true,
    description:
      'Reduces the unskilled penalty (DM−3) by 1 per level. With Jack-of-all-Trades 3 the penalty is fully negated. There is no benefit at level 0 or above level 3. Cannot be improved through study or via the Connections rule.',
  },

  Language: {
    name: 'Language',
    specs: ['galanglic', 'vilani', 'zdetl', 'oynprith', 'trokh', 'gvegh'],
    hasParent: true,
    description:
      'Reading and writing in a different language. All Travellers can speak and read their native language without needing the skill, and automated computer translators mean Language is not always needed on other worlds. Language 0 implies a smattering of simple phrases in a few common languages.',
    specDescriptions: {
      galanglic: 'The common trade language of the Third Imperium, derived from English.',
      vilani: 'Spoken by the Vilani of the First Imperium — the "Latin" of the Third Imperium.',
      zdetl: 'The Zhodani spoken language.',
      oynprith: 'The Droyne ritual language.',
      trokh: 'The Aslan spoken language.',
      gvegh: 'The Vargr spoken language.',
    },
    tasks: [
      { name: 'Order a meal, ask for basic directions', difficulty: 'routine', characteristic: 'EDU', timeframe: '1D seconds' },
      { name: 'Hold a simple conversation', difficulty: 'average', characteristic: 'EDU', timeframe: '1D × 10 seconds' },
    ],
  },

  Leadership: {
    name: 'Leadership',
    specs: [],
    hasParent: true,
    description:
      'Directing, inspiring and rallying allies and comrades. A Traveller may make a Leadership action in combat (see Combat chapter).',
    tasks: [
      { name: 'Shout an order', difficulty: 'average', characteristic: 'SOC', timeframe: '1D seconds' },
      { name: 'Rally shaken troops', difficulty: 'difficult', characteristic: 'SOC', timeframe: '1D seconds' },
    ],
  },

  Mechanic: {
    name: 'Mechanic',
    specs: [],
    hasParent: true,
    description:
      'Maintaining and repairing most equipment — some advanced equipment and spacecraft components require Engineer instead. Unlike Engineer or Science, Mechanic does not allow building new devices, but it covers all types of equipment.',
    tasks: [
      { name: 'Repair a damaged system in the field', difficulty: 'average', characteristic: ['INT', 'EDU'], timeframe: '1D minutes' },
    ],
  },

  Medic: {
    name: 'Medic',
    specs: [],
    hasParent: true,
    description:
      'Emergency first aid and battlefield triage as well as diagnosis, treatment, surgery and long-term care. See Injury and Recovery for the rules.',
    tasks: [
      { name: 'First aid', difficulty: 'average', characteristic: 'EDU', timeframe: '1D rounds' },
      { name: 'Treat poison or disease', difficulty: 'average', characteristic: 'EDU', timeframe: '1D hours' },
      { name: 'Long-term care', difficulty: 'average', characteristic: 'EDU', timeframe: '1 day' },
    ],
  },

  Melee: {
    name: 'Melee',
    specs: ['unarmed', 'blade', 'bludgeon', 'natural'],
    hasParent: true,
    description:
      'Hand-to-hand combat and the use of melee weapons.',
    specDescriptions: {
      unarmed: 'Punching, kicking, wrestling, improvised weapons.',
      blade: 'Swords, rapiers, blades and other edged weapons.',
      bludgeon: 'Maces, clubs, staves.',
      natural: 'Weapons that are part of an alien or creature — claws, teeth.',
    },
    tasks: [
      { name: 'Swing a sword', difficulty: 'average', characteristic: ['STR', 'DEX'], timeframe: '1D seconds', spec: 'blade' },
    ],
  },

  Navigation: {
    name: 'Navigation',
    specs: [],
    hasParent: true,
    description:
      'The planetside counterpart of Astrogation: plotting courses and finding directions on the ground.',
    tasks: [
      { name: 'Plot a course using an orbiting beacon', difficulty: 'routine', characteristic: ['INT', 'EDU'], timeframe: '1D × 10 minutes' },
      { name: 'Avoid getting lost in thick jungle', difficulty: 'difficult', characteristic: 'INT', timeframe: '1D hours' },
    ],
  },

  Persuade: {
    name: 'Persuade',
    specs: [],
    hasParent: true,
    description:
      'A more casual, informal version of Diplomat — fast talking, bargaining, wheedling, bluffing. Also covers bribery and intimidation.',
    tasks: [
      { name: 'Bluff your way past a guard', difficulty: 'average', characteristic: ['INT', 'SOC'], timeframe: '1D minutes', opposed: 'Persuade' },
      { name: 'Intimidate a thug', difficulty: 'average', characteristic: ['STR', 'SOC'], timeframe: '1D minutes', opposed: 'Persuade' },
    ],
  },

  Pilot: {
    name: 'Pilot',
    specs: ['small craft', 'spacecraft', 'capital ships'],
    hasParent: true,
    description:
      'Different forms of spacecraft. See the Spacecraft Operations chapter for details.',
    specDescriptions: {
      'small craft': 'Shuttles and other craft under 100 tons.',
      spacecraft: 'Trade ships and other vessels between 100 and 5,000 tons.',
      'capital ships': 'Battleships and other ships over 5,000 tons.',
    },
  },

  Profession: {
    name: 'Profession',
    specs: ['belter', 'biologicals', 'civil engineering', 'construction', 'hydroponics', 'polymers'],
    hasParent: true,
    specRequired: true,
    description:
      'Trained in producing useful goods or services. Each specialty must be learned individually — levels in Profession do not grant other specialties at level 0. A Profession check earns Cr250 × Effect per month on a planet that supports that trade.',
    specDescriptions: {
      belter: 'Mining asteroids for valuable ores and minerals.',
      biologicals: 'Engineering and managing artificial organisms.',
      'civil engineering': 'Designing structures and buildings.',
      construction: 'Building orbital habitats and megastructures.',
      hydroponics: 'Growing crops in hostile environments.',
      polymers: 'Designing and using polymers.',
    },
  },

  Recon: {
    name: 'Recon',
    specs: [],
    hasParent: true,
    description:
      'Scouting out dangers and spotting threats, unusual objects, or out-of-place people.',
    tasks: [
      { name: 'Work out the routine of a guard patrol', difficulty: 'average', characteristic: 'INT', timeframe: '1D × 10 minutes' },
      { name: 'Spot the sniper before they shoot you', difficulty: 'average', characteristic: 'INT', timeframe: '1D × 10 seconds', opposed: 'Stealth' },
    ],
  },

  Science: {
    name: 'Science',
    specs: ['archaeology', 'astronomy', 'biology', 'chemistry', 'cosmology', 'cybernetics', 'economics', 'genetics', 'history', 'linguistics', 'philosophy', 'physics', 'planetology', 'psionicology', 'psychology', 'robotics', 'sophontology', 'xenology'],
    hasParent: true,
    specRequired: true,
    description:
      'Knowledge and practical application of one or more scientific fields. Includes archaeology of ancient civilisations and the Ancients.',
    specDescriptions: {
      archaeology: 'Ancient civilisations including previous Imperiums and Ancients.',
      astronomy: 'Stars and celestial phenomena.',
      biology: 'Living organisms.',
      chemistry: 'Matter at atomic, molecular and macromolecular levels.',
      cosmology: 'The universe and its creation.',
      cybernetics: 'Blending living and synthetic life.',
      economics: 'Trade and markets.',
      genetics: 'Genetic codes and engineering.',
      history: 'The past as seen through documents and records.',
      linguistics: 'Languages.',
      philosophy: 'Beliefs and religions.',
      physics: 'Fundamental forces.',
      planetology: 'Planet formation and evolution.',
      psionicology: 'Psionic powers and phenomena.',
      psychology: 'Thought and society.',
      robotics: 'Robot construction and use.',
      sophontology: 'Intelligent living creatures.',
      xenology: 'Alien life forms.',
    },
    tasks: [
      { name: 'Remember a commonly known fact', difficulty: 'routine', characteristic: 'EDU', timeframe: '1D minutes' },
      { name: 'Research a problem', difficulty: 'average', characteristic: 'INT', timeframe: '1D days' },
    ],
  },

  Seafarer: {
    name: 'Seafarer',
    specs: ['ocean ships', 'personal', 'sail', 'submarine'],
    hasParent: true,
    description:
      'Watercraft and ocean travel.',
    specDescriptions: {
      'ocean ships': 'Motorised sea-going vessels.',
      personal: 'Very small waterborne craft — canoes, rowboats.',
      sail: 'Wind-driven watercraft.',
      submarine: 'Vehicles that travel underwater.',
    },
    tasks: [
      { name: 'Control a canoe in a violent storm', difficulty: 'formidable', characteristic: 'END', timeframe: '1D hours', spec: 'personal' },
    ],
  },

  Stealth: {
    name: 'Stealth',
    specs: [],
    hasParent: true,
    description:
      'Staying unseen, unheard, and unnoticed.',
    tasks: [
      { name: 'Sneak past a guard', difficulty: 'average', characteristic: 'DEX', timeframe: '1D × 10 seconds', opposed: 'Recon' },
      { name: 'Avoid detection by a security patrol', difficulty: 'average', characteristic: 'DEX', timeframe: '1D minutes', opposed: 'Recon' },
    ],
  },

  Steward: {
    name: 'Steward',
    specs: [],
    hasParent: true,
    description:
      'Serving and caring for nobles and high-class passengers — proper address and behaviour, cooking, tailoring, basic management. Required on any ship offering high passage.',
    tasks: [
      { name: 'Cook a fine meal', difficulty: 'average', characteristic: 'EDU', timeframe: '1D hours' },
      { name: 'Calm down an angry duke', difficulty: 'difficult', characteristic: 'SOC', timeframe: '1D minutes' },
    ],
  },

  Streetwise: {
    name: 'Streetwise',
    specs: [],
    hasParent: true,
    description:
      'Understanding of urban environments and the power structures in society. On the homeworld, the Traveller knows criminal contacts and fixers. On other worlds, they can quickly intuit power structures and fit into local underworlds.',
    tasks: [
      { name: 'Find a dealer in illegal materials', difficulty: 'average', characteristic: 'INT', timeframe: '1D × 10 hours' },
      { name: 'Evade a police search', difficulty: 'average', characteristic: 'INT', timeframe: '1D × 10 minutes', opposed: 'Recon' },
    ],
  },

  Survival: {
    name: 'Survival',
    specs: [],
    hasParent: true,
    description:
      'The wilderness counterpart of Streetwise — surviving in the wild, building shelters, hunting or trapping, avoiding exposure. Recognises plants and animals of the homeworld and related planets.',
    tasks: [
      { name: 'Gather supplies to survive a week', difficulty: 'average', characteristic: 'EDU', timeframe: '1D days' },
      { name: 'Identify a poisonous plant', difficulty: 'average', characteristic: ['INT', 'EDU'], timeframe: '1D × 10 seconds' },
    ],
  },

  Tactics: {
    name: 'Tactics',
    specs: ['military', 'naval'],
    hasParent: true,
    description:
      'Tactical planning and decision-making, from board games to squad combat to fleet engagements.',
    specDescriptions: {
      military: 'Co-ordinating attacks of foot troops or vehicles on the ground.',
      naval: 'Co-ordinating attacks of a spacecraft or fleet.',
    },
    tasks: [
      { name: 'Develop a strategy for attacking an enemy base', difficulty: 'average', characteristic: 'INT', timeframe: '1D × 10 hours', spec: 'military' },
    ],
  },

  'Vacc Suit': {
    name: 'Vacc Suit',
    specs: [],
    hasParent: true,
    description:
      'Wearing and operating spacesuits and environmental suits. Rarely needs a check under ordinary circumstances — possessing the skill is enough. If the Traveller lacks the suit\'s required level, they suffer DM−1 to all skill checks per missing level. Also permits operating advanced battle armour.',
    tasks: [
      { name: 'Perform a systems check on battle dress', difficulty: 'average', characteristic: 'EDU', timeframe: '1D minutes' },
    ],
  },

  /* ─────────────── Psionic talents (treated as skills) ─────────────── */

  Telepathy: {
    name: 'Telepathy',
    specs: [],
    hasParent: true,
    notTrainable: true,
    description:
      'Mind-to-mind contact. Subtle by nature but can be used to crush wills bluntly. Encompasses life detection, mind link, telempathy, reading and sending thoughts, suggestion, probe, and assault. Acquired only through the Psion career or institute training.',
  },

  Clairvoyance: {
    name: 'Clairvoyance',
    specs: [],
    hasParent: true,
    notTrainable: true,
    description:
      'Perception at a distance — sense, clairvoyance (sight), clairaudience (hearing), clairsentience (both), and tactical awareness. Other psionics cannot detect clairvoyant activity.',
  },

  Telekinesis: {
    name: 'Telekinesis',
    specs: [],
    hasParent: true,
    notTrainable: true,
    description:
      'Mind over matter — moving objects at range, telekinetic punches, microkinesis for fine work, pyrokinesis for heat, and self-flight. PSI cost typically scales with mass moved.',
  },

  Awareness: {
    name: 'Awareness',
    specs: [],
    hasParent: true,
    notTrainable: true,
    description:
      'Fine control of one\'s own body — converting PSI to temporary STR/END boosts, fortitude (PSI armour), inspiration (DM+2 to a check), regeneration of lost characteristics, and suspended animation. Awareness powers are personal-only.',
  },

  Teleportation: {
    name: 'Teleportation',
    specs: [],
    hasParent: true,
    notTrainable: true,
    description:
      'Instantaneous movement of one\'s body from one point to another. Requires a known destination and respects energy/momentum laws — planetary surface jumps capped at Very Distant range with elevation changes ≤ 400 m.',
  },
};

/** Cap during character creation. */
export const SKILL_CAP_DURING_CREATION = 4;

/** Connections rule: max free skills per character. */
export const CONNECTIONS_RULE_MAX_BONUSES = 2;

/** Connections rule cap on skill level when granted via the connections rule. */
export const CONNECTIONS_RULE_SKILL_CAP = 3;
