import fs from 'fs';

export interface IDependency {
  name: string;
  type: DependencyType;
}

type DependencyType = keyof DependencyTypes; // DependencyTypes的key名

interface DependencyTypes {
  dependency: InstallationInstruction;
  devDependency: InstallationInstruction;
}

type InstallationInstruction = {
  yarn: string;
  npm: string;
};
