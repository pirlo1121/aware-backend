const mongoose = require('mongoose');
const { Schema } = mongoose;

// ─── Sub-schema: Bloque de contenido ───────────────────────────────────────

const ContentBlockSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['paragraph', 'heading', 'image', 'quote', 'list'],
      required: true,
    },

    // Para: paragraph, heading, quote
    content: {
      type: String,
      validate: {
        validator: function () {
          return ['paragraph', 'heading', 'quote'].includes(this.type)
            ? Boolean(this.content)
            : true;
        },
        message: 'El campo "content" es requerido para paragraph, heading y quote.',
      },
    },

    // Para: heading (H1–H6)
    level: {
      type: Number,
      min: 1,
      max: 6,
      validate: {
        validator: function () {
          return this.type === 'heading' ? this.level != null : true;
        },
        message: 'El campo "level" es requerido para bloques de tipo heading.',
      },
    },

    // Para: image
    imageUrl: {
      type: String,
      validate: {
        validator: function () {
          return this.type === 'image' ? Boolean(this.imageUrl) : true;
        },
        message: 'El campo "imageUrl" es requerido para bloques de tipo image.',
      },
    },

    // Para: list
    items: {
      type: [String],
      validate: {
        validator: function () {
          if (this.type !== 'list') return true;

          return (
            Array.isArray(this.items) &&
            this.items.length > 0 &&
            this.items.every(item => item.trim().length > 0)
          );
        },
        message: 'El campo "items" debe tener al menos un elemento para bloques de tipo list.',
      },
    },
  },
  { _id: false } // Los bloques no necesitan su propio _id
);

// ─── Schema principal: Post ─────────────────────────────────────────────────

const PostSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'El título es obligatorio.'],
      trim: true,
      maxlength: [200, 'El título no puede superar los 200 caracteres.'],
    },

    slug: {
      type: String,
      required: [true, 'El slug es obligatorio.'],
      unique: true,           // ✅ Corregido: evita colisiones de URL
      lowercase: true,
      trim: true,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'El slug solo puede contener letras minúsculas, números y guiones.',
      ],
    },

    excerpt: {
      type: String,
      trim: true,
      maxlength: [500, 'El excerpt no puede superar los 500 caracteres.'],
    },

    coverImage: {
      type: String,           // ✅ Guarda solo el path relativo, no la URL completa
      trim: true,
    },

    content: {
      type: [ContentBlockSchema]
    },

    tags: {
      type: [String],
      default: [],
      set: (tags) => tags.map((t) => t.toLowerCase().trim()), // Normaliza los tags
    },

    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El autor es obligatorio.'],
    },

    status: {
      type: String,
      enum: {
        values: ['draft', 'published'],
        message: 'El estado debe ser "draft" o "published".',
      },
      default: 'draft',
    },

    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // ✅ Genera createdAt y updatedAt automáticamente
  }
);


ContentBlockSchema.pre('validate', function () {
  if (this.type !== 'list') {
    this.items = undefined;
  }

  if (this.type !== 'image') {
    this.imageUrl = undefined;
  }

  if (this.type !== 'heading') {
    this.level = undefined;
  }

});

// ─── Middleware ─────────────────────────────────────────────────────────────

// Asigna publishedAt automáticamente al publicar
PostSchema.pre('save', function () {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
});

// También aplica en findOneAndUpdate
PostSchema.pre('findOneAndUpdate', function () {
  const update = this.getUpdate();
  if (update?.status === 'published' || update?.$set?.status === 'published') {
    this.setUpdate({
      ...update,
      $set: { ...(update.$set || {}), publishedAt: new Date() },
    });
  }
});

// ─── Índices ────────────────────────────────────────────────────────────────

PostSchema.index({ status: 1, publishedAt: -1 }); // Listar posts publicados ordenados
PostSchema.index({ status: 1, updatedAt: -1 });    // Listar drafts ordenados (getDrafts)
PostSchema.index({ tags: 1 });                     // Filtrar por tag
PostSchema.index({ author: 1 });                   // Posts por autor

// ─── Exportar ───────────────────────────────────────────────────────────────

const Post = mongoose.model('Post', PostSchema);
module.exports = Post;
