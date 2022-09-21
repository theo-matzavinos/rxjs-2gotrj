import './style.css';

import {
  of,
  map,
  Observable,
  ReplaySubject,
  tap,
  scan,
  timeout,
  finalize,
  concatMap,
  timer,
  take,
  connectable,
  interval,
  Subject,
} from 'rxjs';

const requests = new ReplaySubject();
const batchedRequests = requests.pipe(
  tap(console.log),
  scan((acc, val) => [...acc, val], []),
  timeout({ each: 1, with: ({ lastValue }) => of(lastValue) }),
  tap(console.log),
  finalize(() => requests.complete())
);
const request = batchedRequests.pipe(
  tap(() => console.log('qq')),
  concatMap(() =>
    timer(2000).pipe(
      take(1),
      tap(() => console.log('next')),
      finalize(() => console.log('done'))
    )
  )
);

const batch = connectable(request);

interval(100)
  .pipe(take(10))
  .subscribe((i) => {
    console.log('??');
    requests.next(i);
  });

const subscription = batch.connect();
setTimeout(() => subscription.unsubscribe(), 2000);

const makeRequest = <T>(request: any) => {
  const subject = new Subject<T>();
  
  requests.next({ request, subject });

  return subject.asObservable().pipe(finalize(() => subscription.unsubscribe()));
}