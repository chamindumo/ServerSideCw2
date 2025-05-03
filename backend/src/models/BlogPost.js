class BlogPost {
  constructor(id, userId, title, content, country, visitDate, likes = 0, dislikes = 0) {
    this.id = id;
    this.userId = userId;
    this.title = title;
    this.content = content;
    this.country = country;
    this.visitDate = visitDate;
    this.likes = likes;
    this.dislikes = dislikes;
  }
}

module.exports = BlogPost;
