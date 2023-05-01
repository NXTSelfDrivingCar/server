from perceptron import Perceptron
from cnn import CNN
import numpy as np

def load_config_from_file(path: str):
    models = np.load(path, allow_pickle=True).item()

    perc_config = models['perc_config']

    weights = perc_config['weights']
    biases = perc_config['biases']
    activation = perc_config['activation']
    learning_rate = perc_config['learning_rate']
    layers = perc_config['layers']

    perc = Perceptron(fun=activation, base_fun='lrelu')\
            .setLearningRate(learning_rate)\
            .setLayersLoad(layers)\
            .setWeights(weights)\
            .setBias(biases)\
            .build_me()

    cnn_config = models['cnn_config']

    layers = cnn_config['layers']

    cnn = CNN(layers)

    return {'perceptron': perc, 'cnn': cnn}

def save_config_to_file(path: str, perc: Perceptron, cnn: CNN):
    perc_config = {
        'weights': perc.getWeights(),
        'biases': perc.getBias(),
        'activation': perc.getActivation(),
        'learning_rate': perc.getLearningRate(),
        'layers': perc.getLayers()
    }

    cnn_config = {
        'layers': cnn.getLayers()
    }

    np.save(path, { 'perc_config': perc_config, 'cnn_config': cnn_config })