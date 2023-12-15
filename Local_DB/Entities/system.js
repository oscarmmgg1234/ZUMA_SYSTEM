import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class System_Timer_All {
  @PrimaryGeneratedColumn()
  id = undefined;
  @Column("type")
  name = "";
}
