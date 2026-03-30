# Maxify Stack
This is a basic express app with a UI, designed to be run locally to convert a minified stack trace into a human readable format using source maps.

It was created by [Timber Logging](https://www.timberlogging.co) but you don't need to be a customer to use this. It is a free utility to convert minified stack traces.

## Usage

### 1. Download this project
* Go to the [Maxify Stack project on GitHub](https://github.com/timber-logging/maxify-stack)
* Press the Code menu button and select "Download ZIP"
* Extract the ZIP file to where you want the project in your local system

Here are the [GitHub instructions](https://docs.github.com/en/get-started/start-your-journey/downloading-files-from-github).

### 2. Install Dependencies
In your console, within this project folder, enter `npm install`

### 3. Create Source Maps
See the [Source Maps](#source-maps) section below

### 4. Create `folder-paths.json`
In the project root, there is a `folder-paths.example.json` file. Rename this file to `folder-paths.json` and add the full folder path to the source maps that you created in the last step.

It should contain something like this:
``` json
[
  "/full/folder/path/to/your/project/build/.source-maps"
]
```

### 5. Run the project
* In your console, enter `npm start`
* In your browser, go to `http://localhost:4000`
* Select the folder path you want to run for.
* Paste in your minified stack trace. If it has "\n" showing because of where you copied it from, then press the "Replace" button and it will replace "\n" with new line characters 

## Requirements
- Node.js >= 20.x (might work with other versions, but it is not checked)
- Source maps must be enabled in your build configuration (see [Source Maps Section](#source-maps))

## Source Maps
For this utility to work, you need to generate source maps for your project. This is not done by default.

The source maps must be created from the exact version of the files as what generated the minified stack trace. For example, if you get a minified stack trace from logs in production, but your local files have been modified, when you generate the source maps they will not match to your production minified files.

In this case, you will need to get the production version of your files and generate the source maps from these files.

We recommend generating the source maps in a different folder to your build folder so you don't deploy them to production, and they aren't overwritten by build/dev/test processes. Also ensure you set the source map folder in your .gitignore file.

### NextJs built/hosted by Vercel
By default, source maps are not created in production. If you run `vercel build --prod` it will create a build which is as close as possible to the production build, but you need the vercel CLI installed. Otherwise you can run `next build`, but there can be differences which will mean the minified stack can't be decoded. If possible, use the vercel CLI.

#### NextJs (if you do have vercel CLI)

- Ensure the vercel CLI package is up to date
- Ensure you have linked the project
- Ensure you use the same version of NodeJs as what you are using in vercel (eg 22.x 24.x)

**next.config.js**
Update your next.config.js file.

```js
// next.config.js

// used by build-source-maps
const shouldGenerateSourceMaps = process.env.BUILD_SOURCE_MAPS === 'true';
const config = {
  // this is here so when the build runs locally, we build source maps so we can
  // decode the minified stack output from production. By default, production
  // builds don't include source maps and deployed versions should not include them 
  productionBrowserSourceMaps: shouldGenerateSourceMaps
};
export default config;
```

**package.json**
Add the following scripts to your `package.json`:

``` json
{
  "scripts": {
    "build-source-maps": "vercel pull --environment=production && BUILD_SOURCE_MAPS=true vercel build --prod",
  },
}
```

- Command `vercel pull --environment=production` will pull the production env variables and config into your .vercel folder. It will not update/modify your local env files.
- Command `BUILD_SOURCE_MAPS=true vercel build --prod` will create a build and put it in the `.vercel/output` folder
- Both commands can be run using `npm run build-source-maps` if setup as per above in the `package.json`
- Ensure `.vercel` is in your `.gitignore`
- You will need to get the full folder path to the `.vercel/output` folder and use it in your `folder-paths.json` file.


#### NextJs (if you don't have vercel CLI)

**next.config.js**
Update your next.config.js file. This conditionally creates a `.source-maps` build folder if one of the above scripts is called. This prevents the source maps from being added in production (which you probably don't want to do).

```js
// next.config.js

// used by build-source-maps
const shouldGenerateSourceMaps = process.env.BUILD_SOURCE_MAPS === 'true';
const buildOutputDirectory = shouldGenerateSourceMaps ? '.source-maps' : '.next';

const config = {
  // this is here so when the build runs locally, we build source maps so we can
  // decode the minified stack output from production. By default, production
  // builds don't include source maps and deployed versions should not include them 
  productionBrowserSourceMaps: shouldGenerateSourceMaps,

  // if we run build-source-maps, then we use this output so running npm run dev
  // doesn't wipe the maps. Then each deploy, we run the build-source-maps, then
  // we have prod maps to use in the maxify-stack project to debug
  distDir: buildOutputDirectory,
};
export default config;
```

**package.json**
Add the following scripts to your `package.json`:

``` json
{
  "scripts": {
    "build-source-maps": "BUILD_SOURCE_MAPS=true next build",
  },
}
```

**.gitignore**
Update your .gitignore file with the following so you don't commit the source maps.
`.source-maps/`

**Build Source Maps**
Now you can run `npm run build-source-maps` and the source maps will be built.

You will need to get the full folder path to the `.source-maps` or `.next` folder and use it in your `folder-paths.json` file.

## Troubleshooting
If you see `minified file not found` at the end of every line then it is likely the source map files don't match the minified stack trace. If the stack trace is from production, create the source maps using the deployed version. See [Source Maps](#source-maps) for more information.

Any change to the files will result it completely different filenames when minified.

If the minified logs are from your front end, it is possible the user using an older version of your app from leaving a tab open.

## License
This project is licensed under the MIT License.
