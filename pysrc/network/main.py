from perceptron import Perceptron
from activation import Activation
from cnn import CNN, CNN_Layer

import numpy as np
import cv2
import os

IMAGES_PATH = "./src/samplesNXT/"

IMAGE_WIDTH = 80
IMAGE_HEIGHT = 60

TRESHOLD = 180

def load_images():
    images = []

    for path in os.listdir(IMAGES_PATH):
        loaded_image = cv2.imread(IMAGES_PATH + path, cv2.IMREAD_GRAYSCALE)
        flipped_image = cv2.flip(loaded_image, 1)

        resized_image = cv2.resize(flipped_image, (IMAGE_WIDTH, IMAGE_HEIGHT)).T

        # cut image by half of height
        cut_image = resized_image[round(IMAGE_HEIGHT / 2):, :]

        _, mask = cv2.threshold(cut_image, thresh=TRESHOLD, maxval=255, type=cv2.THRESH_BINARY)
        cut_image_masked = cv2.bitwise_and(cut_image, mask)

        images.append(cut_image_masked)

    return images

def get_random_images(images, count):
    training_images_index = list(np.random.choice(len(images), count, replace=False))
    testing_images_index = list(set(range(len(images))) - set(training_images_index))

    training_data = [ images[index] for index in training_images_index ]
    testing_data = [ images[index] for index in testing_images_index ]

    return training_data, testing_data

def get_lables(images, default_image_treshold=40):
    lables = []
    for image in images:
        left_image = image[:, :round((image.shape[0] / 5) * 2)]
        middle_image = image[:, round((image.shape[0] / 5) * 2):round((image.shape[0] / 5) * 3)]
        right_image = image[:, round((image.shape[0] / 5) * 3):]

        answers = np.array([np.sum(left_image >= 10), np.sum(middle_image >= 10), np.sum(right_image >= 10)])

        norm_answers = np.zeros_like(answers)

        # if all pixels are below treshold, then it's a default image (black image)
        norm_answers[np.argmax(answers)] = 0 if (answers < default_image_treshold).all() else 1

        lables.append(norm_answers)

    return lables

def get_accuracy(model, images, lables, test_count):
    hits = 0
    for i in range(test_count):
        results = model.FeedForwardFlex(np.array([images[i]]).T, vb=0)
        a = results[-1]
        #print(a.shape)
        a = np.where(a == np.max(a), 1, 0)
        val = a.flatten()

        if (val == lables[i]).all():
            hits += 1

    accuracy = round(hits/test_count*100, 2)

    return accuracy


def main():
    
    # define filters
    l1_filter = np.zeros((4, 3, 3))

    l1_filter[0, :, :] = np.array([[
        [-1, 0, 1],
        [-1, 0, 1],
        [-1, 0, 1]]])

    l1_filter[1, :, :] = np.array([[
        [1, 0, -1],
        [1, 0, -1],
        [1, 0, -1]]])

    l1_filter[2, :, :] = np.array([[
        [1, 1, 1],
        [0, 0, 0],
        [-1, -1, -1]]])

    l1_filter[3, :, :] = np.array([[
        [-1, -1, -1],
        [0, 0, 0],
        [1, 1, 1]]])

    # Define layers
    layer_1 = CNN_Layer(l1_filter, 'relu', 'SamePadding', 'max')
    layer_2 = CNN_Layer(l1_filter, 'relu', 'SamePadding', 'max')

    cnn_model = CNN([layer_1])

    prepare = True
    if prepare:
        total = 2006
        train_image_count = 1500
        testing_image_count = total - train_image_count

        # load images
        images = load_images()

        # get random images
        training_data, testing_data = get_random_images(images, train_image_count)

        # get lables
        training_lables = np.array(get_lables(training_data))
        testing_lables = np.array(get_lables(testing_data))

        print("Preparing testing data...")
        testing_input = cnn_model.prepare_data(testing_data, testing_image_count)

        print("Preparing training data...")
        training_input = cnn_model.prepare_data(training_data, train_image_count)

        # save data
        np.save("preparedTestingData", { "input": testing_input, "lables": testing_lables } )
        np.save("preparedTrainingData", { "input": training_input, "lables": training_lables } )
    else:
        # load input values
        testing_input = np.load("preparedTestingData.npy", allow_pickle=True).item()['input']
        training_input = np.load("preparedTrainingData.npy", allow_pickle=True).item()['input']

        # load lables
        testing_lables = np.load("preparedTestingData.npy", allow_pickle=True).item()['lables']
        training_lables = np.load("preparedTrainingData.npy", allow_pickle=True).item()['lables']

    # Define perceptron
    activation_dict = {
        '0': 'sigmoid',
        '1': 'sigmoid',
        '2': 'sigmoid',
        '3': 'sigmoid',
        '4': 'sigmoid'
    }

    perc = Perceptron(fun=activation_dict, base_fun='lrelu')\
                                                .setLayers(
                                                    training_input.shape[1], [
                                                    training_input.shape[1]//2,
                                                    training_input.shape[1]//4,
                                                    training_input.shape[1]//8,
                                                    training_input.shape[1]//16],
                                                    3)\
                                                .setLearningRate(0.004)\
                                                .setBias()\
                                                .setWeights()\
                                                .build_me()

    eras = 1000
    steps = 1000

    max_accuracy = 0
    best_era = 0

    trained_layers = 0

    for e in range(eras):
        print("Current era: " + str(e + 1))
        print("Training layers: ", trained_layers)

        perc.Train(training_input, training_lables, steps, no_layers = trained_layers)

        accuracy = get_accuracy(perc, testing_input, testing_lables, testing_image_count)

        if accuracy >= max_accuracy:
            max_accuracy = accuracy
            best_era = e
            np.save("./src/networks3/NNTestLReluEnd_2248_1000-" + str(e) + "-" + str(round(accuracy)), np.array(perc.getWeights(), dtype=object))

        print("Era: " + str(e + 1) + " Accuracy: " + str(accuracy) + "%")
        print("Max accuracy: " + str(max_accuracy) + "% in era: " + str(best_era + 1) + "\n")


if __name__ == '__main__':
    main()