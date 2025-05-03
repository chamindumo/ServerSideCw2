class Admin {
  constructor(id, username, role = 'admin', createdAt = new Date()) {
    this.id = id;
    this.username = username;
    this.role = role;
    this.createdAt = createdAt;
  }
}

module.exports = Admin;