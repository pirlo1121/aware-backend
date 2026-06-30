const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Post = require('../models/Post');
const User = require('../models/User');
const slugify = require('slugify');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI);
const posts = [
  // ─── PUBLISHED POSTS ─────────────────────────────────────────────

  {
    title: 'El sufrimiento no siempre debe evitarse',
    slug: 'el-sufrimiento-no-siempre-debe-evitarse',
    excerpt:
      'Intentar eliminar todo dolor de nuestra vida puede impedirnos crecer. Los estoicos veían la dificultad como una oportunidad para fortalecer el carácter.',
    coverImage:
      'https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f',
    status: 'published',
    tags: ['estoicismo', 'filosofia', 'resiliencia'],
    content: [
      {
        type: 'paragraph',
        content:
          'Vivimos en una cultura que busca la comodidad permanente. Sin embargo, gran parte de nuestro crecimiento ocurre cuando enfrentamos situaciones difíciles.'
      },
      {
        type: 'heading',
        content: 'Dolor y sufrimiento no son lo mismo',
        level: 2
      },
      {
        type: 'paragraph',
        content:
          'El dolor es inevitable. El sufrimiento suele aparecer cuando resistimos o rechazamos aquello que ya ocurrió.'
      },
      {
        type: 'quote',
        content:
          'La dificultad muestra de qué estamos hechos.'
      },
      {
        type: 'list',
        items: [
          'Aceptar la realidad tal como es',
          'Diferenciar lo controlable de lo incontrolable',
          'Encontrar aprendizaje en la adversidad'
        ]
      },
      {
        type: 'paragraph',
        content:
          'Los estoicos no buscaban el sufrimiento, pero entendían que evitarlo a cualquier costo nos vuelve más frágiles.'
      }
    ]
  },

  {
    title: '¿Por qué repetimos conductas que nos hacen daño?',
    slug: 'por-que-repetimos-conductas-que-nos-hacen-dano',
    excerpt:
      'Muchas personas conocen aquello que les perjudica, pero aun así vuelven a hacerlo. La psicología ofrece algunas respuestas.',
    coverImage:
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773',
    status: 'published',
    tags: ['psicologia', 'conducta', 'habitos'],
    content: [
      {
        type: 'paragraph',
        content:
          'Las personas no siempre actúan según lo que saben. En muchas ocasiones repetimos conductas que nos perjudican incluso cuando conocemos sus consecuencias.'
      },
      {
        type: 'heading',
        content: 'La fuerza de los hábitos',
        level: 2
      },
      {
        type: 'paragraph',
        content:
          'Gran parte de nuestro comportamiento es automático. El cerebro intenta ahorrar energía repitiendo patrones conocidos.'
      },
      {
        type: 'image',
        imageUrl:
          'https://images.unsplash.com/photo-1499209974431-9dddcece7f88'
      },
      {
        type: 'list',
        items: [
          'Recompensa inmediata',
          'Coste diferido',
          'Repetición automática',
          'Refuerzo emocional'
        ]
      },
      {
        type: 'quote',
        content:
          'Saber qué hacer no siempre significa estar preparado para hacerlo.'
      }
    ]
  },

  {
    title: 'Adicciones modernas: cuando el problema no es la sustancia',
    slug: 'adicciones-modernas-cuando-el-problema-no-es-la-sustancia',
    excerpt:
      'Las adicciones ya no se limitan al alcohol o las drogas. Hoy también pueden encontrarse en aplicaciones, apuestas y redes sociales.',
    coverImage:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9',
    status: 'published',
    tags: ['adicciones', 'psicologia', 'salud-mental'],
    content: [
      {
        type: 'paragraph',
        content:
          'Durante años asociamos la palabra adicción únicamente con sustancias. Sin embargo, ciertas conductas pueden generar patrones similares.'
      },
      {
        type: 'heading',
        content: 'La economía de la atención',
        level: 2
      },
      {
        type: 'paragraph',
        content:
          'Muchas plataformas digitales están diseñadas para captar y mantener nuestra atención durante el mayor tiempo posible.'
      },
      {
        type: 'list',
        items: [
          'Redes sociales',
          'Videojuegos',
          'Apuestas online',
          'Pornografía',
          'Compras compulsivas'
        ]
      },
      {
        type: 'quote',
        content:
          'Lo peligroso no siempre es aquello que consume tu cuerpo, sino aquello que consume tu tiempo.'
      },
      {
        type: 'paragraph',
        content:
          'Reconocer el patrón es el primer paso para recuperar el control.'
      }
    ]
  },

  {
    title: 'La soledad: castigo o oportunidad',
    slug: 'la-soledad-castigo-oportunidad',
    excerpt:
      'La soledad suele verse como algo negativo, pero también puede convertirse en un espacio para el crecimiento y la reflexión.',
    coverImage:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
    status: 'published',
    tags: ['soledad', 'filosofia', 'psicologia'],
    content: [
      {
        type: 'paragraph',
        content:
          'Muchas personas temen quedarse solas. Sin embargo, la historia está llena de pensadores que encontraron en la soledad un espacio de transformación.'
      },
      {
        type: 'heading',
        content: 'Soledad e aislamiento',
        level: 2
      },
      {
        type: 'paragraph',
        content:
          'No son lo mismo. El aislamiento suele ser involuntario, mientras que la soledad puede elegirse conscientemente.'
      },
      {
        type: 'quote',
        content:
          'Quien aprende a estar consigo mismo deja de depender completamente de los demás.'
      },
      {
        type: 'list',
        items: [
          'Mayor autoconocimiento',
          'Reflexión profunda',
          'Menos distracciones',
          'Mejor regulación emocional'
        ]
      }
    ]
  },

  // ─── DRAFT POSTS ─────────────────────────────────────────────

  {
    title: 'El miedo a la muerte en la filosofía',
    slug: 'el-miedo-a-la-muerte-en-la-filosofia',
    excerpt:
      'Desde Epicuro hasta los existencialistas, numerosos filósofos han intentado responder una de las preguntas más difíciles de la humanidad.',
    coverImage:
      'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2',
    status: 'draft',
    tags: ['filosofia', 'existencialismo'],
    content: [
      {
        type: 'paragraph',
        content:
          'La muerte es una de las pocas certezas de la vida, y precisamente por eso ha sido objeto de reflexión durante siglos.'
      },
      {
        type: 'heading',
        content: 'La visión de Epicuro',
        level: 2
      },
      {
        type: 'paragraph',
        content:
          'Epicuro sostenía que no debemos temer a la muerte porque cuando ella llega nosotros ya no estamos.'
      },
      {
        type: 'quote',
        content:
          'La muerte no es nada para nosotros.'
      }
    ]
  },

  {
    title: 'Cómo se forma una adicción',
    slug: 'como-se-forma-una-adiccion',
    excerpt:
      'Comprender cómo surge una adicción puede ayudarnos a prevenirla y detectarla antes de que tome el control de nuestra vida.',
    coverImage:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    status: 'draft',
    tags: ['adicciones', 'neurociencia'],
    content: [
      {
        type: 'paragraph',
        content:
          'Las adicciones suelen desarrollarse de forma gradual. Lo que comienza como una conducta ocasional puede convertirse en una necesidad.'
      },
      {
        type: 'heading',
        content: 'El circuito de recompensa',
        level: 2
      },
      {
        type: 'list',
        items: [
          'Estímulo',
          'Recompensa',
          'Repetición',
          'Dependencia'
        ]
      }
    ]
  },

  {
    title: 'El estoicismo frente a la ansiedad',
    slug: 'el-estoicismo-frente-a-la-ansiedad',
    excerpt:
      'Aunque fue desarrollado hace casi dos mil años, el estoicismo contiene herramientas sorprendentemente útiles para enfrentar la ansiedad moderna.',
    coverImage:
      'https://images.unsplash.com/photo-1499209974431-9dddcece7f88',
    status: 'draft',
    tags: ['estoicismo', 'ansiedad', 'psicologia'],
    content: [
      {
        type: 'paragraph',
        content:
          'La ansiedad suele estar relacionada con escenarios futuros. Los estoicos insistían en regresar la atención al momento presente.'
      },
      {
        type: 'heading',
        content: 'La dicotomía del control',
        level: 2
      },
      {
        type: 'paragraph',
        content:
          'Una de las ideas centrales del estoicismo consiste en distinguir aquello que depende de nosotros y aquello que no.'
      },
      {
        type: 'quote',
        content:
          'Nos perturban más nuestras interpretaciones que los hechos.'
      }
    ]
  },

  {
    title: '¿Somos realmente libres?',
    slug: 'somos-realmente-libres',
    excerpt:
      'La filosofía lleva siglos preguntándose si nuestras decisiones son realmente nuestras o si están determinadas por fuerzas externas.',
    coverImage:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    status: 'draft',
    tags: ['filosofia', 'libre-albedrio'],
    content: [
      {
        type: 'paragraph',
        content:
          'La pregunta por la libertad ha acompañado a la humanidad desde la antigüedad.'
      },
      {
        type: 'heading',
        content: 'Determinismo y libre albedrío',
        level: 2
      },
      {
        type: 'paragraph',
        content:
          'Algunas corrientes sostienen que todo está determinado por causas previas. Otras defienden que tenemos capacidad real de elección.'
      },
      {
        type: 'list',
        items: [
          'Determinismo',
          'Compatibilismo',
          'Libertarismo filosófico'
        ]
      },
      {
        type: 'quote',
        content:
          'La libertad comienza cuando examinamos nuestras propias decisiones.'
      }
    ]
  }
  ,
{
  title: 'La procrastinación no es pereza',
  slug: 'la-procrastinacion-no-es-pereza',
  excerpt:
    'Muchas veces no postergamos tareas por falta de disciplina, sino por emociones que no sabemos gestionar.',
  coverImage:
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72',
  status: 'published',
  tags: ['psicologia', 'productividad', 'habitos'],
  content: [
    {
      type: 'paragraph',
      content:
        'La procrastinación suele ser una estrategia temporal para evitar emociones desagradables.'
    },
    {
      type: 'heading',
      content: 'El problema emocional',
      level: 2
    },
    {
      type: 'quote',
      content:
        'No evitamos la tarea, evitamos cómo nos hace sentir.'
    }
  ]
},

{
  title: 'El poder de caminar todos los días',
  slug: 'el-poder-de-caminar-todos-los-dias',
  excerpt:
    'Una actividad simple puede generar beneficios físicos y mentales sorprendentes.',
  coverImage:
    'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429',
  status: 'published',
  tags: ['salud', 'ejercicio', 'bienestar'],
  content: [
    {
      type: 'paragraph',
      content:
        'Caminar diariamente mejora la salud cardiovascular y ayuda a reducir el estrés.'
    },
    {
      type: 'image',
      imageUrl:
        'https://images.unsplash.com/photo-1465189684280-6a8fa9b19a7a'
    }
  ]
},

{
  title: 'Por qué nos cuesta cambiar de opinión',
  slug: 'por-que-nos-cuesta-cambiar-de-opinion',
  excerpt:
    'Nuestro cerebro tiende a proteger las creencias existentes incluso frente a nueva evidencia.',
  coverImage:
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3',
  status: 'published',
  tags: ['psicologia', 'sesgos', 'pensamiento'],
  content: [
    {
      type: 'paragraph',
      content:
        'Cambiar de opinión puede sentirse como una amenaza para nuestra identidad.'
    },
    {
      type: 'quote',
      content:
        'La inteligencia también consiste en corregirse.'
    }
  ]
},

{
  title: 'La disciplina vence a la motivación',
  slug: 'la-disciplina-vence-a-la-motivacion',
  excerpt:
    'La motivación fluctúa. La disciplina permite avanzar incluso cuando no tenemos ganas.',
  coverImage:
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438',
  status: 'published',
  tags: ['disciplina', 'habitos', 'productividad'],
  content: [
    {
      type: 'paragraph',
      content:
        'Las personas constantes no siempre están motivadas, pero sí comprometidas.'
    },
    {
      type: 'list',
      items: [
        'Crear rutinas',
        'Reducir fricción',
        'Mantener consistencia'
      ]
    }
  ]
},

{
  title: 'Cómo afecta el sueño a nuestra mente',
  slug: 'como-afecta-el-sueno-a-nuestra-mente',
  excerpt:
    'Dormir poco tiene consecuencias mucho mayores de lo que solemos imaginar.',
  coverImage:
    'https://images.unsplash.com/photo-1455642305367-68834a9dfe17',
  status: 'published',
  tags: ['salud', 'sueno', 'neurociencia'],
  content: [
    {
      type: 'paragraph',
      content:
        'Durante el sueño el cerebro consolida recuerdos y regula emociones.'
    },
    {
      type: 'quote',
      content:
        'Dormir bien es una inversión, no una pérdida de tiempo.'
    }
  ]
},

{
  title: 'El arte de escuchar',
  slug: 'el-arte-de-escuchar',
  excerpt:
    'Escuchar activamente es una habilidad más rara y valiosa de lo que parece.',
  coverImage:
    'https://images.unsplash.com/photo-1515169067868-5387ec356754',
  status: 'draft',
  tags: ['comunicacion', 'psicologia'],
  content: [
    {
      type: 'paragraph',
      content:
        'Muchas personas escuchan para responder, no para comprender.'
    },
    {
      type: 'heading',
      content: 'Escucha activa',
      level: 2
    }
  ]
},

{
  title: 'La filosofía de Marco Aurelio',
  slug: 'la-filosofia-de-marco-aurelio',
  excerpt:
    'Las Meditaciones siguen siendo una fuente de sabiduría práctica dos mil años después.',
  coverImage:
    'https://images.unsplash.com/photo-1516979187457-637abb4f9353',
  status: 'draft',
  tags: ['estoicismo', 'filosofia'],
  content: [
    {
      type: 'paragraph',
      content:
        'Marco Aurelio escribió para sí mismo, pero terminó ayudando a millones.'
    },
    {
      type: 'quote',
      content:
        'La felicidad depende de la calidad de tus pensamientos.'
    }
  ]
},

{
  title: '¿Qué es el pensamiento crítico?',
  slug: 'que-es-el-pensamiento-critico',
  excerpt:
    'Una habilidad esencial en una época saturada de información.',
  coverImage:
    'https://images.unsplash.com/photo-1455390582262-044cdead277a',
  status: 'draft',
  tags: ['pensamiento', 'aprendizaje', 'filosofia'],
  content: [
    {
      type: 'paragraph',
      content:
        'Pensar críticamente implica evaluar evidencia antes de aceptar una afirmación.'
    },
    {
      type: 'list',
      items: [
        'Analizar',
        'Cuestionar',
        'Verificar',
        'Concluir'
      ]
    }
  ]
}
];

const importData = async () => {
  try {
    const users = await User.find();

    if (users.length === 0) {
      console.error('No hay usuarios en la base de datos. Ejecuta primero: npm run seed');
      process.exit(1);
    }

    const admin = users.find(u => u.role === 'admin');
    const normal = users.find(u => u.role === 'user');
    console.log('user admins....', admin)

    await Post.deleteMany();

    // const postsWithAuthors = posts.map((post, index) => ({
    //   ...post,
    //   author: index % 2 === 0 ? admin._id : normal._id
    // }));
    const postsWithAuthors = posts.map((post) => {
      return {
        ...post,
        author: admin._id
      }
    })

    await Post.create(postsWithAuthors);

    console.log(`¡${posts.length} artículos creados exitosamente!`);
    console.log(`  → ${posts.filter(p => p.status === 'published').length} publicados`);
    console.log(`  → ${posts.filter(p => p.status === 'draft').length} en draft`);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Post.deleteMany();
    console.log('Todos los artículos han sido eliminados.');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
