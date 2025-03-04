async logout(token: string) {
  await this.redisService.del(`token:${token}`);
  return true;
} 