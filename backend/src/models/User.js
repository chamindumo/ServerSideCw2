class User {
  constructor(id, username, email, password, role = 'user', plan = 'basic') {
    this.id = id;
    this.username = username;
    this.email = email;
    this.password = password;
    this.role = role;
    this.plan = plan;
    this.followers = 0;
    this.apiKeyLimit = this.calculateApiKeyLimit();
  }

  calculateApiKeyLimit() {
    switch (this.plan) {
      case 'basic':
        return 5;
      case 'pro':
        return 10;
      case 'pro_plus':
        return 15;
      default:
        throw new Error('Invalid plan');
    }
  }
}

module.exports = User;