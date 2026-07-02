const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Post = require('../models/Post');
const User = require('../models/User');
const slugify = require('slugify');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI);
const posts = [

  {
  title: 'La disciplina vale más que la motivación',
  slug: 'la-disciplina-vale-mas-que-la-motivacion',
  excerpt:
    'La motivación es variable. La disciplina permite actuar incluso cuando las ganas desaparecen.',
  coverImage:
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&q=80&fm=webp',
  status: 'published',
  tags: ['disciplina', 'habitos', 'desarrollo-personal'],
  content: [
    {
      type: 'paragraph',
      content:
        'Esperar a sentirse motivado puede convertirse en una excusa para no actuar. La disciplina crea consistencia.'
    },
    {
      type: 'heading',
      content: 'Hacer lo necesario',
      level: 2
    },
    {
      type: 'paragraph',
      content:
        'Las personas disciplinadas no siempre tienen más ganas, simplemente actúan a pesar de ellas.'
    },
    {
      type: 'quote',
      content:
        'La disciplina es elegir entre lo que quieres ahora y lo que quieres más.'
    }
  ]
},
{
  title: 'El precio oculto de la comparación constante',
  slug: 'el-precio-oculto-de-la-comparacion-constante',
  excerpt:
    'Compararnos continuamente con otros puede erosionar nuestra autoestima y alejarnos de nuestros propios objetivos.',
  coverImage:
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1200&q=80&fm=webp',
  status: 'published',
  tags: ['psicologia', 'autoestima', 'reflexion'],
  content: [
    {
      type: 'paragraph',
      content:
        'Las redes sociales facilitan la comparación permanente. Vemos los mejores momentos de otros y los comparamos con nuestra vida cotidiana.'
    },
    {
      type: 'list',
      items: [
        'Genera insatisfacción',
        'Distorsiona la realidad',
        'Reduce la gratitud',
        'Aumenta la ansiedad'
      ]
    },
    {
      type: 'quote',
      content:
        'La comparación roba la alegría.'
    }
  ]
},
{
  title: 'Por qué el descanso también es productividad',
  slug: 'por-que-el-descanso-tambien-es-productividad',
  excerpt:
    'Descansar no significa perder el tiempo. El rendimiento sostenible depende de la recuperación.',
  coverImage:
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80&fm=webp',
  status: 'published',
  tags: ['salud', 'productividad', 'bienestar'],
  content: [
    {
      type: 'paragraph',
      content:
        'Trabajar sin descanso puede parecer eficiente a corto plazo, pero termina reduciendo la concentración y la creatividad.'
    },
    {
      type: 'heading',
      content: 'Recuperar energía',
      level: 2
    },
    {
      type: 'paragraph',
      content:
        'Dormir bien y tomar pausas adecuadas permite rendir mejor durante más tiempo.'
    }
  ]
},
{
  title: 'La incomodidad como herramienta de crecimiento',
  slug: 'la-incomodidad-como-herramienta-de-crecimiento',
  excerpt:
    'Aprender, emprender o cambiar hábitos suele implicar atravesar etapas incómodas.',
  coverImage:
    'https://images.unsplash.com/photo-1500534623283-312aade485b7?w=1200&q=80&fm=webp',
  status: 'published',
  tags: ['crecimiento', 'estoicismo', 'mentalidad'],
  content: [
    {
      type: 'paragraph',
      content:
        'La mayoría de las habilidades valiosas requieren atravesar periodos de incertidumbre y frustración.'
    },
    {
      type: 'quote',
      content:
        'Lo que hoy resulta incómodo mañana puede convertirse en fortaleza.'
    }
  ]
},
{
  title: 'La atención es el recurso más valioso',
  slug: 'la-atencion-es-el-recurso-mas-valioso',
  excerpt:
    'En una época llena de estímulos, aprender a concentrarse es una ventaja competitiva.',
  coverImage:
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80&fm=webp',
  status: 'published',
  tags: ['productividad', 'enfoque', 'tecnologia'],
  content: [
    {
      type: 'paragraph',
      content:
        'Cada notificación interrumpe nuestros procesos mentales y dificulta el trabajo profundo.'
    },
    {
      type: 'list',
      items: [
        'Reducir distracciones',
        'Bloques de concentración',
        'Descansos programados',
        'Prioridades claras'
      ]
    }
  ]
},
{
  title: 'El miedo al fracaso y sus consecuencias',
  slug: 'el-miedo-al-fracaso-y-sus-consecuencias',
  excerpt:
    'Muchas personas no fracasan porque lo intentan, sino porque nunca empiezan.',
  coverImage:
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80&fm=webp',
  status: 'published',
  tags: ['psicologia', 'miedo', 'superacion'],
  content: [
    {
      type: 'paragraph',
      content:
        'El miedo al fracaso puede generar procrastinación y evitar que asumamos riesgos necesarios.'
    },
    {
      type: 'quote',
      content:
        'Fracasar intentando suele enseñar más que nunca haber comenzado.'
    }
  ]
},
{
  title: 'Cómo construir hábitos que realmente duren',
  slug: 'como-construir-habitos-que-realmente-duren',
  excerpt:
    'Los cambios sostenibles suelen comenzar con acciones pequeñas y consistentes.',
  coverImage:
    'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1200&q=80&fm=webp',
  status: 'published',
  tags: ['habitos', 'productividad', 'psicologia'],
  content: [
    {
      type: 'paragraph',
      content:
        'Intentar cambiar demasiadas cosas al mismo tiempo suele terminar en abandono.'
    },
    {
      type: 'list',
      items: [
        'Empezar pequeño',
        'Mantener consistencia',
        'Eliminar fricción',
        'Medir progreso'
      ]
    }
  ]
},
{
  title: 'La soledad y el arte de conocerse',
  slug: 'la-soledad-y-el-arte-de-conocerse',
  excerpt:
    'Pasar tiempo a solas puede ayudarnos a comprender mejor nuestros pensamientos y prioridades.',
  coverImage:
    'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=1200&q=80&fm=webp',
  status: 'published',
  tags: ['filosofia', 'reflexion', 'bienestar'],
  content: [
    {
      type: 'paragraph',
      content:
        'La soledad elegida ofrece un espacio para reflexionar sin la influencia constante de estímulos externos.'
    },
    {
      type: 'heading',
      content: 'Escuchar la propia voz',
      level: 2
    },
    {
      type: 'paragraph',
      content:
        'Dedicar tiempo a pensar y escribir ayuda a aclarar ideas y fortalecer la identidad personal.'
    },
    {
      type: 'quote',
      content:
        'Quien aprende a estar consigo mismo rara vez se siente vacío.'
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
