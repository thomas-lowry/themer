![Themer promo image](img/themer-banner-v2.0-github.png?raw=true "Themer promo")

# Themer
Themer enables you to create and swap themes from your *published* styles in your team library. Use it for color, text and effect styles.

### How to use:
Themer associates a list of styles with a theme name. When you have multiple themes, Themer will swap styles which share the same style names across themes.

In order for Themer to be used across your team, generic information about your styles is shared on a service external to Figma called [jsonbin.io](https://jsonbin.io/). You will need an account with an API key to get started. The onboarding in Themer will get you setup.

1. Insert your API key from JSONbin

2. Create your first theme with a unique name. You can pull all local styles, gather styles from a selection, or even an entire page. 

*Tip*: If all of your styles exist within one document, you can also prefix your style names with 'theme1/' or 'theme2/' and set Themer to generate multiuple themes at once.

3. With your themes created, you can now apply them to a selection or the entire page. Remember, your design must make use of the same styles from one of the themes to work.

### Privacy:
Themer stores information about your styles at a service external to Figma. For each theme, we store the name of the theme, the name of the style, the type of style (color, text, effect), and a unique key required to import your styles into a document from your team library. No other data from your file is sent to Jsonbin. Your unique API key is storred locally as well, so if you use Themer across devices, between team members, or between Figma Desktop and Figma in the browser, you will need to re-enter your API key and your Bin URL so that everyone/everywhere has access to the same list of Themes.

### Roadmap:
• Currently Themer does not yet work text boxes which contan multiple text styles, the plan is to enable this in the near future
