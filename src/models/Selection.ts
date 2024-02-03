export class Selection {
  from: number;

  to: number;

  collapsed: boolean;

  constructor(from: number, to: number) {
    this.from = from;
    this.to = to;
    this.collapsed = from === to;
  }

  public static createEmpty(): Selection {
    return new Selection(0, 0);
  }
}
