# New site setup

This file describes some of the steps you need to take to convert the 
LazyWebApp into a new, correctly branded application. 






## Update environment

Update both `environment.ts` and `environment.dev.ts` - comment out services that are not used

## Update env file
1) Copy `env.example`, name as .env
2) Update with relevant site settings

## Ensure that you set a privacy policy and terms and conditions
Update `privacy.component.html` and `terms.component.html`


## Update image branding 
1) Replace `favicon.ico`
2) Replace all images in `/assets/img/icons/`
3) Replace `/assets/img/logo-square-white.png`
4) Replace `logo-long-white.png`
5) Search for `lazy-web-app`. Replace with the project name in github `sausage-case`
7) Search for `LazyWebApp`. Replace with the real, human readable name you want to call the application, e.g. `MusicTunes`

## Update themes



## Ensure index.html elements are updated 
Change loading page color in the line
~~~
background: linear-gradient(rgb(63,81,181), rgb(47,60,132));
~~~
