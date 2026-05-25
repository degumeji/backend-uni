export class Rating {
  constructor(
    public readonly id: string | null,
    public readonly studentId: string,
    public readonly teacherId: string,
    public readonly classId: string,
    public readonly score: number,
    public readonly comment: string | null,
    public readonly createdAt: Date,
  ) {}

  /**
   * Factoría para crear una nueva calificación validando reglas de negocio básicas.
   */
  static create(
    studentId: string,
    teacherId: string,
    classId: string,
    score: number,
    comment?: string,
  ): Rating {
    if (score < 1 || score > 5) {
      throw new Error('La calificación debe estar entre 1 y 5.');
    }
    
    const sanitizedComment = comment?.trim() || null;
    
    return new Rating(null, studentId, teacherId, classId, score, sanitizedComment, new Date());
  }
}
