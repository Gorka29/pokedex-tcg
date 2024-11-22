import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[appLazyLoad]',
  standalone: true
})
export class LazyLoadDirective {
  @Input('src') src: string = '';

  constructor({ nativeElement }: ElementRef<HTMLImageElement>) {
    const img = nativeElement;
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // placeholder

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          img.src = this.src;
          observer.disconnect();
        }
      });
    }, {
      rootMargin: '50px'
    });

    observer.observe(img);
  }
}
