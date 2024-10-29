// The body of the request is validated by the CreateUrlDto class.
// The body will consist of 2 fields, a URL which will be called the long URL (original)
// and an optional field called customShortUrl which will be the short URL (is it is customized by the user).
export class CreateUrlDto {
  longUrl: string;
  customShortUrl?: string;
}
