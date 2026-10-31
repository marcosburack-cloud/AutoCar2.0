export class Usuario {
  private _nome!: string;
  private _email!: string;
  private _senha!: string;
  private _cpf!: string;

  constructor(nome: string, email: string, senha: string, cpf: string) {
    this.nome = nome;
    this.email = email;
    this.senha = senha;
    this.cpf = cpf;
  }

  // Getters e Setters Protegidos
  get nome(): string {
    return this._nome;
  }

  set nome(valor: string) {
    if (!valor || valor.trim().length < 3) {
      throw new Error("O nome deve ter no mínimo 3 caracteres.");
    }
    this._nome = valor.trim();
  }

  get email(): string {
    return this._email;
  }

  set email(valor: string) {
    if (!Usuario.validarEmail(valor)) {
      throw new Error("O e-mail informado é inválido.");
    }
    this._email = valor.toLowerCase().trim();
  }

  get senha(): string {
    return this._senha;
  }

  set senha(valor: string) {
    if (!Usuario.validarNivelSenha(valor)) {
      throw new Error(
        "A senha precisa ter no mínimo 8 caracteres, incluindo uma letra maiúscula, um número e um caractere especial."
      );
    }
    this._senha = valor;
  }

  get cpf(): string {
    return this._cpf;
  }

  set cpf(valor: string) {
    const cpfLimpo = valor.replace(/\D/g, "");
    if (!Usuario.validarCPF(cpfLimpo)) {
      throw new Error("O CPF informado é inválido.");
    }
    this._cpf = cpfLimpo;
  }

  // --- Validações de Negócio ---

  public static validarEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  public static validarNivelSenha(senha: string): boolean {
    return /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(senha);
  }

  public static validarCPF(cpf: string): boolean {
    const numeros = cpf.replace(/\D/g, "");
    if (numeros.length !== 11 || /^(\d)\1{10}$/.test(numeros)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) soma += Number(numeros[i]) * (10 - i);
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== Number(numeros[9])) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) soma += Number(numeros[i]) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== Number(numeros[10])) return false;

    return true;
  }

  public toJSON() {
    return {
      nome: this._nome,
      email: this._email,
      cpf: this._cpf,
    };
  }
}