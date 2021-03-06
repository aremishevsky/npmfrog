import { IAuthor } from './package-json';
import Searchable from './Searchable';
import Package from './Package';
// tslint:disable-next-line:no-submodule-imports
import vuetifyColors from 'vuetify/es5/util/colors';
import * as parseAuthors from 'parse-authors';

const forbiddenColors = ['shades', 'grey', 'blueGrey'];

export default class Crafter extends Searchable {
  public get initials(): string | undefined {
    if (this.name) {
      let nameParts = this.name.split(', ');
      if (nameParts.length === 2) {
        return `${nameParts[1].charAt(0)}${nameParts[0].charAt(0)}`;
      }
      nameParts = this.name.split(' ');
      if (nameParts.length === 2) {
        return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`;
      }
      return this.name.charAt(0);
    }
  }

  private static lastUsedColorNumber: number = -1;
  private static colors: string[] = Object.keys(vuetifyColors).filter(color => {
    return !forbiddenColors.some(forbidden => forbidden === color) && !color.startsWith('light');
  });
  private static allCrafters: Crafter[] = [];

  public readonly name: string = '';
  public readonly email: string = '';
  public readonly url: string = '';

  private backgroundColor?: string;

  public get color(): string {
    if (this.backgroundColor) {
      return this.backgroundColor;
    }
    if (Crafter.lastUsedColorNumber >= Crafter.colors.length - 1) {
      Crafter.lastUsedColorNumber = -1;
    }
    Crafter.lastUsedColorNumber++;
    const colorKey = Crafter.colors[Crafter.lastUsedColorNumber]
      .replace(/(?:^|\.?)([A-Z])/g, (x, y) => '-' + y.toLowerCase())
      .replace(/^-/, '');
    return (this.backgroundColor = colorKey);
  }

  constructor(author?: IAuthor | string) {
    super();
    if (author) {
      if (typeof author === 'string') {
        const authorObject = parseAuthors(author)[0];
        Object.assign(this, authorObject);
      } else {
        Object.assign(this, author);
      }
    }
    const alreadyCreatedCrafter = Crafter.allCrafters.find(crafter => crafter.equals(this));
    if (alreadyCreatedCrafter) {
      return alreadyCreatedCrafter;
    } else {
      Crafter.allCrafters.push(this);
    }
  }

  public matches(other: Searchable, packages: Package[]): boolean {
    if (other instanceof Crafter && other.equals(this)) {
      return true;
    }
    if (other instanceof Package && other.crafters.some(crafter => crafter.equals(this))) {
      return true;
    }
    for (const item of packages) {
      if (item.matches(this) && item.matches(other)) {
        return true;
      }
    }
    return false;
  }

  public getSearchItemText(): string[] {
    const text: string[] = [];
    if (this.name) {
      text.push(
        this.name,
        `author:${this.name}`,
        `@${this.name}`,
        `crafter:${this.name}`,
        `contributor:${this.name}`,
        `collaborator:${this.name}`,
      );
    }
    text.push(this.name || '', this.email || '', this.url || '', this.initials || '');
    return text;
  }

  public toString(): string {
    return `${this.name}`;
  }

  public equals(other: Crafter): boolean {
    if (this.email && other.email) {
      return this.email === other.email;
    }
    return this.name === other.name && this.email === other.email && this.url === other.url;
  }
}
