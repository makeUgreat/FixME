export interface Repository<Entity> {
  save(entity: Entity): Promise<Entity>;
  findOneById(id: string): Promise<Entity | null>;
}
