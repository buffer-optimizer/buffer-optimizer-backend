/**
 * @author Kingsley Baah Brew <kingsleybrew@gmail.com>
 * @return string
 * @todo Its returns the absolute path to the main application root folder
 */
const getRootDirectory = () => __dirname.replace(/\/utils$/,'');

export default getRootDirectory;