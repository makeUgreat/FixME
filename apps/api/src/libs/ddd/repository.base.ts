export interface Repository<Entity> {
  save(entity: Entity): Promise<Entity>;
  findById(id: string): Promise<Entity | null>;
}
