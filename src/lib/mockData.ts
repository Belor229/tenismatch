export const MOCK_ADS = [
    {
        id: 1,
        user_id: 1,
        type: 'partenaire',
        title: 'Cherche partenaire niveau Intermédiaire',
        description: 'Disponible les soirs de semaine pour des matchs amicaux au Tennis Club de Paris.',
        city: 'Paris',
        display_name: 'Julien T.',
        user_level: 'intermediaire',
        created_at: new Date().toISOString()
    },
    {
        id: 2,
        user_id: 2,
        type: 'match',
        title: 'Match amical ce weekend',
        description: 'Je cherche un adversaire pour un match en 3 sets samedi après-midi.',
        city: 'Lyon',
        display_name: 'Sophie M.',
        user_level: 'avance',
        created_at: new Date().toISOString()
    },
    {
        id: 3,
        user_id: 3,
        type: 'materiel',
        title: 'Vends raquette Wilson Pro Staff',
        description: 'Excellent état, cordage neuf. Prix : 120€.',
        city: 'Bordeaux',
        display_name: 'Pierre D.',
        user_level: 'avance',
        created_at: new Date().toISOString()
    }
];

export const MOCK_PROFILE = {
    user_id: 1,
    display_name: 'Utilisateur Démo',
    city: 'Paris',
    level: 'intermediaire',
    bio: 'Passionné de tennis depuis 5 ans.',
    created_at: new Date().toISOString()
};
