
This folder contains a minimal Next.js scaffold.

Commands:


React Bootstrap & Supabase

This project includes React Bootstrap for UI components and the Supabase JS client for interacting with Supabase projects.

Setup:


```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```



Data shape notes:


```json
{
  "name": "Full Name",
  "contactTypes": [
    { "contactType": "facebookGlenn", "metadata": "" },
    { "contactType": "email", "metadata": "name@example.com" }
  ]
}
```

`contactTypes` is an **array of objects** with `{ contactType: string, metadata: string }`.

Note: There are **no** root-level `email` or `metadata` fields in the stored object — email is represented as a `contactTypes` entry with `contactType: "email"` and the email value in `metadata`.

Rates:


```json
{
  "name": "Full Name",
  "contactTypes": [ { "contactType": "email", "metadata": "name@example.com" } ],
  "rates": { "fullDay": 200, "hour": 50 }
}
```

Price review date:


 









