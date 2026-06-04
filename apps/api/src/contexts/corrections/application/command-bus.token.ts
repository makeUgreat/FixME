import { type CommandBus } from '@layer-kernels/application';

export const CORRECTIONS_COMMAND_BUS = Symbol('corrections_command_bus');

export type CorrectionsCommandBus = CommandBus;
