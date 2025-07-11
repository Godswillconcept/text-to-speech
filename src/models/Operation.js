module.exports = (sequelize, DataTypes) => {
  const Operation = sequelize.define("Operation", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: DataTypes.ENUM(
        "text-to-speech",
        "pdf-to-speech",
        "paraphrase",
        "summarize",
        "key-points",
        "change-tone",
        "document-paraphrase",
        "document-summarize",
        "document-key-points",
        "document-change-tone"
      ),
      allowNull: false,
    },
    input: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    output: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("pending", "completed", "failed"),
      defaultValue: "pending",
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  });

  // Define associations
  Operation.associate = (models) => {
    // Operation-User relationship
    Operation.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    // Operation-AudioFile relationship
    Operation.hasOne(models.AudioFile, {
      foreignKey: "operationId",
      as: "audioFile",
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });
  };

  return Operation;
};
