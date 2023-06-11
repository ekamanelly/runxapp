export class DatabaseHelper {
  generateCreateDataMeta(userId: string) {
    return {
      updated_on: Date.now(),
      deleted_on: null,
      created_by: null,
      updatedBy: null,
      deletedBy: null,
    };
  }
}
